import {
    getFromMapOrCreate,
    getPrimaryKeyFromIndexableString
} from 'rxdb/plugins/core';
import {
    TaskQueueRunState
} from './task-queue.js';
import {
    ChangelogOperation,
    ChangelogOperationKey
} from './types.js';
import { AbstractFile } from './file-abstraction.js';
import {
    INDEX_ID_LENGTH,
    INDEX_ROW_ID_LENGTH,
    IndexState
} from './index-state.js';
import { AbstractFileSystemDirectoryHandle } from './abstract-filesystem.js';

export type ChangelogFile = AbstractFile<
    {},
    [
        // indexId
        number,
        // rowId
        number,
        // operation key
        ChangelogOperationKey,
        // indexableString
        string,
        // startPos
        number,
        // endPos
        number
    ]
>;

export function getChangelogFile(
    dirHandlePromise: Promise<AbstractFileSystemDirectoryHandle>,
    maxIndexableStringLength: number,
    jsonPositionSize: number
): ChangelogFile {
    return new AbstractFile(
        dirHandlePromise.then(dirHandle => dirHandle.getFileHandle('changelog.txt', { create: true })),
        0,
        [
            {
                type: 'number',
                length: INDEX_ID_LENGTH
            },
            {
                type: 'number',
                length: INDEX_ROW_ID_LENGTH
            },
            {
                // operationKey
                type: 'string',
                length: 1
            },
            {
                type: 'string',
                length: maxIndexableStringLength
            },
            {
                type: 'number',
                length: jsonPositionSize
            },
            {
                type: 'number',
                length: jsonPositionSize
            }
        ]
    );
}

/**
 * Returns the changelog rows
 * starting with a given changelogRowId
 * Returns all rows from the changelog file,
 * sorted by write time.
 */
export async function getChangelogOperations<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    changelogFile: ChangelogFile,
    indexStates: IndexState<RxDocType>[],
    startRow = 0
) {
    const ret = {
        // required to resume iteration
        lastRowId: startRow,
        operationsByIndexId: new Map<number, ChangelogOperation[]>()
    };
    await changelogFile.readRows(
        runState,
        startRow,
        (row) => {
            ret.lastRowId = ret.lastRowId + 1;
            const [
                indexId,
                rowId,
                operationKey,
                paddedIndexableString,
                startPos,
                endPos
            ] = row;
            const ar = getFromMapOrCreate(
                ret.operationsByIndexId,
                indexId,
                () => []
            );
            const indexState = indexStates[indexId];
            const indexableString = paddedIndexableString.slice(0, indexState.indexableStringLength);
            const primaryKey = getPrimaryKeyFromIndexableString(indexableString, indexState.primaryKeyLength).trim();
            ar.push([
                indexId,
                rowId,
                operationKey,
                [
                    indexableString,
                    primaryKey,
                    startPos,
                    endPos
                ]
            ]);
        }
    );
    return ret;
}

export async function addChangelogOperations<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    changelogFile: ChangelogFile,
    changelogOperations: ChangelogOperation[],
    maxIndexableStringLength: number
) {
    const rows = changelogOperations.map(operation => {
        return [
            operation[0],
            operation[1],
            operation[2],
            operation[3][0].padEnd(maxIndexableStringLength),
            operation[3][2],
            operation[3][3]
        ];
    });
    await changelogFile.appendRows(
        runState,
        rows as any
    );
}

