import {
    BulkWriteRow,
    RxDocumentData,
    RxJsonSchema,
    RxStorageChangeEvent,
    ensureNotFalsy,
    getIndexStringLength,
    getIndexableStringMonad,
    getPrimaryFieldOfPrimaryKey,
    getPrimaryKeyFromIndexableString,
    toArray
} from 'rxdb/plugins/core';
import {
    CLEANUP_INDEX,
    getIndexName
} from '../storage-indexeddb/index.js';
import {
    compareIndexRows,
    toPaddedString
} from './helpers.js';
import {
    ChangelogOperation,
    IndexRow,
    MetaIdMap
} from './types.js';
import { TaskQueueRunState } from './task-queue.js';
import { AbstractFile } from './file-abstraction.js';
import {
    boundEQ
} from 'rxdb/plugins/storage-memory';
import {
    pushAtSortPosition
} from 'array-push-at-sort-position';
import { AbstractFileSystemDirectoryHandle, AbstractFileSystemFileHandle } from './abstract-filesystem.js';

export type IndexFile = AbstractFile<
    {},
    [
        string,
        number,
        number
    ]
>;

export class IndexState<RxDocType> {

    public rows: IndexRow[] = [];
    public readonly metaIdMap: MetaIdMap | undefined;
    public readonly name: string;
    public readonly fileHandle: Promise<AbstractFileSystemFileHandle>;
    public readonly getIndexableString: ReturnType<typeof getIndexableStringMonad<RxDocType>>;
    public readonly indexableStringLength: number;
    public readonly primaryPath: string;
    public readonly primaryKeyLength: number;
    public readonly indexFile: IndexFile;
    constructor(
        public readonly indexId: number,
        public readonly index: string[],
        dirHandlePromise: Promise<AbstractFileSystemDirectoryHandle>,
        public readonly schema: RxJsonSchema<RxDocumentData<RxDocType>>,
        public readonly jsonPositionSize: number
    ) {
        this.name = getIndexName(this.index);
        this.fileHandle = dirHandlePromise.then(dirHandle => dirHandle.getFileHandle(getIndexFileName(indexId), { create: true }));
        this.getIndexableString = getIndexableStringMonad(this.schema, this.index);

        this.indexableStringLength = getIndexStringLength(this.schema, this.index);
        this.primaryPath = getPrimaryFieldOfPrimaryKey(this.schema.primaryKey);
        this.primaryKeyLength = ensureNotFalsy((this.schema.properties as any)[this.primaryPath].maxLength);
        this.metaIdMap = indexId === 0 ? new Map() as MetaIdMap : undefined;
        this.indexFile = new AbstractFile(
            this.fileHandle,
            0,
            [
                {
                    type: 'string',
                    length: this.indexableStringLength
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

    async initRead(
        runState: TaskQueueRunState<RxDocType>
    ) {
        if (this.metaIdMap) {
            this.metaIdMap.clear();
        }

        /**
         * First read the ones from the normal index file
         * (all rows there are already sorted)
         */
        await this.indexFile.readRows(
            runState,
            0,
            (row) => {
                const [
                    indexableString,
                    startPos,
                    endPos
                ] = row;
                const documentId = getPrimaryKeyFromIndexableString(indexableString, this.primaryKeyLength).trim();
                const indexRow: IndexRow = [
                    indexableString,
                    documentId,
                    startPos,
                    endPos
                ];
                if (this.metaIdMap) {
                    this.metaIdMap.set(documentId, indexRow);
                }
                this.rows.push(indexRow);
            }
        );
    }

    runChangelogOperation(
        operation: ChangelogOperation
    ) {
        const rowId = operation[1];
        const indexRow = operation[3];
        const documentId = indexRow[1];

        if (operation[2] === 'A') {
            // is Add
            this.rows.splice(rowId, 0, indexRow);
            if (this.metaIdMap) {
                this.metaIdMap.set(documentId, indexRow);
            }
        } else if (operation[2] === 'D') {
            // is Delete
            this.rows.splice(rowId, 1);
            if (this.metaIdMap) {
                this.metaIdMap.delete(documentId);
            }
        } else if (operation[2] === 'R') {
            // is Replace
            this.rows[rowId] = indexRow;
            if (this.metaIdMap) {
                this.metaIdMap.set(documentId, indexRow);
            }
        } else {
            throw new Error('unknown operation key ' + operation[2]);
        }
    }


    /**
     * Run a write operation on the memory state
     * and returns the changelog operations that must be stored
     * and can be used to replay the actions on other instances.
     */
    appendWriteOperations(
        events: RxStorageChangeEvent<RxDocumentData<RxDocType>>[],
        // startPos and endPos of where each document is written in the documents file.
        dataPointer: [number, number][],
        // an array where new operations get pushed to
        changelogOperations: ChangelogOperation[]
    ) {
        let addIndexRows: IndexRow[] = [];
        const eventsAmount = events.length;
        for (let i = 0; i < eventsAmount; i++) {
            const event = events[i];
            const position = dataPointer[i];
            const docId = event.documentId;

            const newIndexString = this.getIndexableString(event.documentData);
            const previousIndexString = event.previousDocumentData ? this.getIndexableString(event.previousDocumentData) : null;
            const previousRowId = previousIndexString ? boundEQ<IndexRow>(
                this.rows,
                [
                    previousIndexString
                ] as any,
                compareIndexRows
            ) : -1;
            const newIndexRow: IndexRow = [
                newIndexString,
                docId,
                position[0],
                position[1]
            ];
            if (this.metaIdMap) {
                this.metaIdMap.set(docId, newIndexRow);
            }

            if (
                newIndexString === previousIndexString
            ) {
                // index string not changed -> Replace operation
                this.rows[previousRowId] = newIndexRow;
                changelogOperations.push([
                    this.indexId,
                    previousRowId,
                    'R',
                    [
                        newIndexString,
                        docId,
                        position[0],
                        position[1]
                    ]
                ]);
            } else {
                /**
                 * Delete previous entry,
                 * then Add new one at the correct position.
                 */
                if (event.previousDocumentData) {
                    this.rows.splice(previousRowId, 1);
                    changelogOperations.push([
                        this.indexId,
                        previousRowId,
                        'D',
                        [
                            ensureNotFalsy(previousIndexString),
                            docId,
                            position[0],
                            position[1]
                        ]
                    ]);
                }
                addIndexRows.push(newIndexRow);
            }
        }

        addIndexRows = addIndexRows.sort(sortByIndexStringComparator);
        let lastLow = 0;
        let addIndexRowsAmount = addIndexRows.length;
        for (let i = 0; i < addIndexRowsAmount; i++) {
            const indexRow = addIndexRows[i];
            lastLow = pushAtSortPosition(
                this.rows,
                indexRow,
                sortByIndexStringComparator,
                lastLow
            );
            changelogOperations.push([
                this.indexId,
                lastLow,
                'A',
                indexRow
            ]);
        }

        return changelogOperations;
    }

    changeDocumentPosition(
        docData: RxDocumentData<RxDocType>,
        newPosition: [number, number]
    ): ChangelogOperation {
        const indexString = this.getIndexableString(docData);
        const rowId = boundEQ<IndexRow>(
            this.rows,
            [
                indexString
            ] as any,
            compareIndexRows
        );
        const newIndexRow: IndexRow = [
            indexString,
            (docData as any)[this.primaryPath],
            newPosition[0],
            newPosition[1]
        ];
        this.rows[rowId] = newIndexRow;
        const changelogOperation: ChangelogOperation = [
            this.indexId,
            rowId,
            'R',
            newIndexRow
        ];
        return changelogOperation;
    }
}

export function sortByIndexStringComparator<RxDocType>(a: IndexRow, b: IndexRow) {
    if (a[0] < b[0]) {
        return -1;
    } else {
        return 1;
    }
}

export const INDEX_ROW_ID_LENGTH = 8; // max '99999999'
export const INDEX_ID_LENGTH = 5; // max '99999'

export function getIndexFileName(indexId: number): string {
    return 'index-' + toPaddedString(indexId, 5) + '.txt';
}



export function getIndexesFromSchema(
    schema: RxJsonSchema<any>
): string[][] {
    const primaryPath = getPrimaryFieldOfPrimaryKey(schema.primaryKey);
    let indexes = toArray<string[]>(schema.indexes ? schema.indexes as any : []);
    indexes = sortIndexes(indexes);

    indexes = indexes.map(index => {
        const ret = index.slice(0);
        return ret;
    });
    // we need these indexes for internal usage
    indexes.push([
        '_meta.lwt',
        primaryPath
    ]);
    indexes.push(CLEANUP_INDEX);

    // de-duplicate indexes
    const seenIndexes = new Set<string>();
    const indexesTmp = indexes.slice();
    indexes = indexesTmp.filter(index => {
        const indexName = getIndexName(index);
        if (!seenIndexes.has(indexName)) {
            seenIndexes.add(indexName)
            return true;
        } else {
            return false;
        }
    });

    return indexes;
}

/**
 * Because we often refer to the indexId,
 * the order of the indexes is very important
 * and must be deterministic.
 */
export function sortIndexes(indexes: string[][]): string[][] {
    const ret = indexes
        .map(index => ({ index, str: index.join(',') }))
        .sort((a, b) => {
            if (a.str > b.str) {
                return 1;
            } else if (a.str < b.str) {
                return -1;
            } else {
                return 0;
            }
        });
    return ret.map(r => r.index);
}
