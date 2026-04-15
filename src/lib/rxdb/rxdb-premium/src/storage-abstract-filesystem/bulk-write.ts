import {
    BulkWriteRow,
    EventBulk,
    RxDocumentData,
    RxStorageBulkWriteResponse,
    RxStorageChangeEvent,
    RxStorageInstance,
    categorizeBulkWriteRows,
    ensureNotFalsy,
    now
} from 'rxdb/plugins/core';
import {
    broadcastChangelogOperations,
    getTotalDocumentCount
} from './helpers.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import {
    TaskQueueRunState,
    getAccessHandle
} from './task-queue.js';
import {
    DECODER,
    ENCODER,
    writeDocumentRows
} from './documents-file.js';
import { findDocumentsByIdsInternal } from './find-by-ids.js';
import {
    BroadcastChannelMessageChanges,
    ChangelogOperation,
    State
} from './types.js';
import { addChangelogOperations } from './changelog.js';
import {
    appendAttachmentFiles,
    clearDeletedAttachments
} from './attachments.js';

/**
 * Writes are optimized for how people use RxDB.
 * Mostly the storage is fully idle and sometimes
 * the user clicks stuff or something is loaded from
 * a server. Then the storage has to do a big write
 * and afterwards it will be idle again for some time.
 * 
 * The most important factor is not Throughput but Latency!
 * Also the JavaScript process might exit or crash at any time,
 * so it is important that persisted document writes can always be recovered
 * and also that we do not loose any RxChangeEvent emits on the other browser tabs.
 * 
 * Writes happen in three steps:
 * 
 * 1.   Write the new RxChangeEvent to the changes.json.
 *      Now the write is known to be persistend and we can
 *      emit the RxChangeEvent to the other instances and
 *      resolve the return Promise of bulkWrite() call.
 *
 * 2.   Directly after the write Task is done, process the content from the changes.json
 *      by reading the RxChangeEvent and first write the
 *      next RxDocumentData objects into the document.json file.
 *      Then we process the new IndexRows on the in-memory state of the indexes.
 *      Then we write the changeds of the IndexRows into the changelog.txt
 *      file.
 * 
 * 3.   During calls to the RxStorageInstance.cleanup() function
 *      we overwrite the idx-001...txt files with the new actual index
 *      rows from the in-memory state.
 *      When this is done, we can clear the changelog.txt
 */

export async function bulkWrite<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    documentWrites: BulkWriteRow<RxDocType>[],
    context: string
): Promise<Awaited<ReturnType<RxStorageInstance<any, any, any>['bulkWrite']>>> {
    const primaryPath = storageInstance.primaryPath;
    const state = await storageInstance.internals.statePromise;
    const ret: RxStorageBulkWriteResponse<RxDocType> = {
        success: [],
        error: []
    };

    const docIds: string[] = documentWrites.map(row => row.document[primaryPath]) as any;
    const docsInDb = getTotalDocumentCount(state) > 0 ? await findDocumentsByIdsInternal<RxDocType>(storageInstance, docIds, runState) : new Map();

    // trigger this now so it is there afterwards. 
    const changesAccessHandlePromise = getAccessHandle(state.changesFileHandle, runState);
    const categorized = categorizeBulkWriteRows<RxDocType>(
        storageInstance,
        primaryPath,
        docsInDb,
        documentWrites,
        context
    );
    const writeEvents = categorized.eventBulk.events;
    ret.error = categorized.errors;
    const writeRowsAmount = writeEvents.length;
    if (writeRowsAmount > 0) {
        for (let rowId = 0; rowId < writeRowsAmount; rowId++) {
            const writeEvent = writeEvents[rowId];
            ret.success.push(writeEvent.documentData);
        }

        // patch checkpoint
        const lastState = ensureNotFalsy(categorized.newestRow).document;
        ensureNotFalsy(lastState);
        categorized.eventBulk.checkpoint = {
            id: lastState[primaryPath],
            lwt: lastState._meta.lwt
        };

        /**
         * Before we write the json, we notify other instances that there might be unprocessed changes.
         * Doing this improves read performance because we do not have to check
         * the change.json file before each read.
         */
        state.mightHaveUnprocessedChanges = true;
        if (state.broadcastChannel) {
            state.broadcastChannel.postMessage({
                type: 'pre-write',
                mightHaveUnprocessedChanges: true
            } as BroadcastChannelMessageChanges);
        }

        /**
         * Append new/updated attachments.
         * Notice that deleted attachments will be deleted 
         * afterwards in processChangesFileIfRequired()
         * to ensure we do not have a broken state on random process crashes.
         */
        await appendAttachmentFiles(
            runState,
            storageInstance,
            categorized,
            state
        );

        // write to changes.json
        categorized.eventBulk.endTime = now();
        const writeString = JSON.stringify(categorized.eventBulk);
        const writeBuffer = ENCODER.encode(writeString);
        const changesAccessHandle = await changesAccessHandlePromise;
        await changesAccessHandle.write(writeBuffer, { at: 0 });
        await changesAccessHandle.flush();

        /**
         * Emit write event to the other instances
         * Notice that for better performance
         * we directly emit the json string, not the complex object
         * which will automatically be parsed by the storage-remote.
         * @link https://surma.dev/things/is-postmessage-slow/
         */
        storageInstance.changes$.next(writeString as any);

        runState.awaitBeforeFinish.push(
            () => processChangesFileIfRequired(
                runState,
                state,
                storageInstance,
                /**
                 * noEmit=true because here we know that we have
                 * already emitted the RxChangeEvent
                 */
                true
            )
        );
    }
    return ret;
}

/**
 * This funtion ensure all changes from the changes.json
 * have been processed.
 * It must run at the start of each Task from the TaskQueue.
 * Also this must be idempotent so that when the JavaScript
 * process crashes at any point of the function call,
 * it must be able to recover from that state at the next call.
 */
export async function processChangesFileIfRequired<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    state: State,
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    noEmit: boolean = false
) {
    if (!state.mightHaveUnprocessedChanges) {
        return;
    }
    const changesAccessHandle = await getAccessHandle(state.changesFileHandle, runState);
    const changesSize = await changesAccessHandle.getSize();
    if (changesSize === 0) {
        state.mightHaveUnprocessedChanges = false;
        return;
    }

    const readBuffer = new Uint8Array(changesSize);
    await changesAccessHandle.read(readBuffer, { at: 0 });

    const changesContent = DECODER.decode(readBuffer);
    const eventBulk: EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, any> = JSON.parse(changesContent);
    const events = eventBulk.events;
    const documentFileHandle = await getAccessHandle(state.documentFileHandle, runState);
    const documentsDataPointers = await writeDocumentRows(
        runState,
        state.documentFileHandle,
        events
    );
    await documentFileHandle.flush();

    await clearDeletedAttachments(
        runState,
        storageInstance,
        state,
        eventBulk
    );


    if (!noEmit) {
        storageInstance.changes$.next(eventBulk);
    }

    /**
     * Add the changes to the in-memory index-states
     * and remember the changelogOperations.
     */
    const changelogOperations: ChangelogOperation[] = [];
    for (let indexId = 0; indexId < state.indexStates.length; indexId++) {
        const indexState = state.indexStates[indexId];
        indexState.appendWriteOperations(
            events,
            documentsDataPointers,
            changelogOperations
        );
    }

    /**
     * Then write the changelogOperations into the changelog file
     * from where they will be processed at the cleanup()
     */
    await addChangelogOperations(
        runState,
        state.changelogFile,
        changelogOperations,
        state.maxIndexableStringLength
    );

    /**
     * Notify the other instance about the required changelogOperations
     * that must run on the in-memory index-states.
     */
    broadcastChangelogOperations(
        storageInstance,
        state,
        changelogOperations,
        eventBulk
    );

    /**
     * Clear the change.json
     */
    await changesAccessHandle.truncate(0);
    state.mightHaveUnprocessedChanges = false;
    if (state.broadcastChannel) {
        state.broadcastChannel.postMessage({
            type: 'pre-write',
            mightHaveUnprocessedChanges: false
        } as BroadcastChannelMessageChanges);
    }
}
