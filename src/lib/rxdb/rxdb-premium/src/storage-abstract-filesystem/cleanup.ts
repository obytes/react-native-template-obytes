import {
    ensureNotFalsy,
    getStartIndexStringFromLowerBound,
    getStartIndexStringFromUpperBound,
    lastOfArray,
    now
} from 'rxdb/plugins/core';
import {
    CLEANUP_INDEX,
    getIndexName
} from '../storage-indexeddb/index.js';
import {
    BroadcastChannelMessageChanges,
    ChangelogOperation,
    IndexRow
} from './types.js';
import { TaskQueueRunState, getAccessHandle } from './task-queue.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import {
    boundLT,
    boundEQ,
    boundGT
} from 'rxdb/plugins/storage-memory';
import { ENCODER, getDocumentsJson } from './documents-file.js';
import { addChangelogOperations, getChangelogOperations } from './changelog.js';
import { IndexState } from './index-state.js';
import { broadcastChangelogOperations, compareIndexRows } from './helpers.js';
const CLEANUP_INDEX_NAME = getIndexName(CLEANUP_INDEX);

export async function cleanup<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    runState: TaskQueueRunState<RxDocType>,
    minimumDeletedTime: number
): Promise<boolean> {
    // first try to delete too-old documents with _deleted:true
    const purgedDocs = await cleanupDeletedDocuments(
        instance,
        runState,
        minimumDeletedTime
    );
    if (purgedDocs.length > 0) {
        /**
         * let the cleanup run again
         * for the other steps.
         */
        return false;
    }


    const cleanedUpIndexes = await cleanupChangelogOperations(
        instance,
        runState
    );
    if (cleanedUpIndexes.length > 0) {
        /**
         * let the cleanup run again
         * for the other steps.
         */
        return false;
    }

    const cleanedUpDocumentsAmount = await cleanupDocumentJsonFile(
        instance,
        runState
    );
    if (cleanedUpDocumentsAmount > 0) {
        /**
         * let the cleanup run again
         * for the other steps.
         */
        return false;
    }

    // all cleanup steps done
    return true;
}


/**
 * Returns the ids of the purged documents
 */
export async function cleanupDeletedDocuments<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    runState: TaskQueueRunState<RxDocType>,
    minimumDeletedTime: number
): Promise<string[]> {
    const state = await instance.internals.statePromise;
    const cleanupIndexState = ensureNotFalsy(state.indexStates.find(s => s.name === CLEANUP_INDEX_NAME));
    const maxDeletionTime = now() - minimumDeletedTime;

    const lowerBoundString = getStartIndexStringFromLowerBound(
        instance.schema,
        CLEANUP_INDEX,
        [
            true,
            /**
             * Do not use 0 here,
             * because 1 is the minimum value for _meta.lwt
             */
            1
        ]
    );
    const upperBoundString = getStartIndexStringFromUpperBound(
        instance.schema,
        CLEANUP_INDEX,
        [
            true,
            maxDeletionTime
        ]
    );
    let indexOfLower = boundGT<IndexRow>(
        cleanupIndexState.rows,
        [
            lowerBoundString
        ] as any,
        compareIndexRows
    );
    let indexOfUpper = boundLT<IndexRow>(
        cleanupIndexState.rows,
        [
            upperBoundString
        ] as any,
        compareIndexRows
    );
    if (indexOfLower === -1) {
        return [];
    }

    const rowsToPurge = cleanupIndexState.rows.slice(indexOfLower, indexOfUpper + 1);

    const purgedDocumentIds: string[] = [];
    const documentFileAccessHandle = await getAccessHandle(state.documentFileHandle, runState);
    for (const indexRow of rowsToPurge) {
        const docId = indexRow[1];
        purgedDocumentIds.push(docId);
        const docsData = await getDocumentsJson<RxDocType>(
            state,
            documentFileAccessHandle,
            runState,
            [indexRow]
        );
        const docData = docsData[0];
        const changelogOperations: ChangelogOperation[] = [];
        for (const indexState of state.indexStates) {
            const indexString = indexState.getIndexableString(docData);
            const rowId = boundEQ(
                indexState.rows,
                [
                    indexString
                ] as any,
                compareIndexRows
            );

            const changelogOperation: ChangelogOperation = [
                indexState.indexId,
                rowId,
                'D',
                indexState.rows[rowId]
            ];
            changelogOperations.push(changelogOperation);
            indexState.runChangelogOperation(changelogOperation);
        }

        await addChangelogOperations(
            runState,
            state.changelogFile,
            changelogOperations,
            state.maxIndexableStringLength
        );
    }
    return purgedDocumentIds;
}

/**
 * Returns the index states that had a write during the cleanup
 */
export async function cleanupChangelogOperations<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    runState: TaskQueueRunState<RxDocType>
): Promise<IndexState<RxDocType>[]> {
    const state = await instance.internals.statePromise;

    const changelogOperations = await getChangelogOperations(
        runState,
        state.changelogFile,
        state.indexStates,
        0
    );

    const indexStatesWithWrite: IndexState<any>[] = state.indexStates.filter(indexState => {
        const ops = changelogOperations.operationsByIndexId.get(indexState.indexId);
        if (!ops || ops.length === 0) {
            return false;
        } else {
            return true;
        }
    });
    for (const indexState of indexStatesWithWrite) {
        await indexState.indexFile.replaceContent(
            runState,
            indexState.rows.map(indexRow => {
                return [
                    indexRow[0],
                    indexRow[2],
                    indexRow[3]
                ];
            })
        );
    }

    /**
     * TODO what happens if the javascript process
     * crashes here and we have written the new index files
     * but did not delete the changelog?
     */

    // if all indexe files have been updated, clear the changelog file
    if (indexStatesWithWrite.length > 0) {
        await state.changelogFile.empty(runState);
    }

    return indexStatesWithWrite;
}


/**
 * On writes, new document states are just appended to the documents file.
 * Therefore we have to crunch the json-strings so that "empty" parts of the 
 * documents file are filled up again and the file size decreases.
 * 
 * We do this by first overwriting empty space with the space char
 * and then move the next json-document upwards.
 * By doing this we can ensure that even if the cleanup process crashes
 * at any time, we do not end up with a corrupted storage state.
 * 
 * Example steps:
 * {a}{b}{c}???????{d}{e}EOF
 * {a}{b}{c}       {d}{e}EOF
 * {a}{b}{c}{d}       {e}EOF
 * {a}{b}{c}{d}{e}       EOF
 * {a}{b}{c}{d}{e}EOF
 * 
 * The function returns the amount of moved documents.
 */
export async function cleanupDocumentJsonFile<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    runState: TaskQueueRunState<RxDocType>
): Promise<number> {
    const state = await instance.internals.statePromise;

    /**
     * Because we know that new document writes are always appended,
     * we can use the _meta.lwt index so we do not have to sort first.
     */
    const metaLwtIndex = ensureNotFalsy(state.indexStates.find(i => i.index[0] === '_meta.lwt'));
    const lastIndexRow = lastOfArray(metaLwtIndex.rows);
    if (!lastIndexRow) {
        return 0;
    }

    const documentAccessHandle = await getAccessHandle(
        state.documentFileHandle,
        runState
    );
    const documentFileSize = await documentAccessHandle.getSize();

    if (state.broadcastChannel) {
        state.broadcastChannel.postMessage({
            type: 'pre-write',
            mightHaveUnprocessedChanges: true
        } as BroadcastChannelMessageChanges);
    }


    const maxDocPerCall = 50;
    let currentPosition = 0;
    let moveCount = 0;
    let idx = 0;
    while (true) {
        if (moveCount >= maxDocPerCall) {
            return moveCount;
        }

        const indexRow = metaLwtIndex.rows[idx];
        idx = idx + 1;
        if (!indexRow) {
            if (currentPosition < documentFileSize) {
                // move EOF
                await documentAccessHandle.truncate(currentPosition);
            }
            return moveCount;
        }

        const startPos = indexRow[2];
        const endPos = indexRow[3];


        if (startPos === currentPosition) {
            currentPosition = endPos;
        } else {
            moveCount = moveCount + 1;
            // doc json must be moved

            const docsData = await getDocumentsJson(
                state,
                documentAccessHandle,
                runState,
                [indexRow]
            );
            const docData = docsData[0];

            // first overwrite file with empty string
            const emptySpaceStart = currentPosition;
            const emptySpaceEnd = startPos;
            const emptySpaceSize = emptySpaceEnd - emptySpaceStart;
            const emptyWriteBuffer = ENCODER.encode(' '.repeat(emptySpaceSize));
            await documentAccessHandle.write(emptyWriteBuffer, { at: emptySpaceStart });

            // then move the indexRow positions
            const opsFirst: ChangelogOperation[] = [];
            for (const indexState of state.indexStates) {
                const op = indexState.changeDocumentPosition(
                    docData,
                    [emptySpaceStart, endPos]
                );
                opsFirst.push(op);
            }
            await addChangelogOperations(
                runState,
                state.changelogFile,
                opsFirst,
                state.maxIndexableStringLength
            );

            broadcastChangelogOperations(
                instance,
                state,
                opsFirst
            );

            // then move document json
            const docDataJsonString = JSON.stringify(docData);
            const jsonSize = docDataJsonString.length;
            const moveDocWriteBuffer = ENCODER.encode(docDataJsonString + (' '.repeat(emptySpaceSize - jsonSize)));
            await documentAccessHandle.write(moveDocWriteBuffer, { at: emptySpaceStart });

            // then move the indexRow positions again
            const newEndPosition = emptySpaceStart + jsonSize;
            const opsSecond: ChangelogOperation[] = [];
            for (const indexState of state.indexStates) {
                const op = indexState.changeDocumentPosition(
                    docData,
                    [emptySpaceStart, newEndPosition]
                );
                opsSecond.push(op);
            }
            await addChangelogOperations(
                runState,
                state.changelogFile,
                opsSecond,
                state.maxIndexableStringLength
            );
            broadcastChangelogOperations(
                instance,
                state,
                opsSecond
            );
            currentPosition = currentPosition + jsonSize;
        }
    }
}
