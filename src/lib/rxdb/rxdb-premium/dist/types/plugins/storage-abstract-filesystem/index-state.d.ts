import { RxDocumentData, RxJsonSchema, RxStorageChangeEvent, getIndexableStringMonad } from 'rxdb/plugins/core';
import { ChangelogOperation, IndexRow, MetaIdMap } from './types.js';
import { TaskQueueRunState } from './task-queue.js';
import { AbstractFile } from './file-abstraction.js';
import { AbstractFileSystemDirectoryHandle, AbstractFileSystemFileHandle } from './abstract-filesystem.js';
export type IndexFile = AbstractFile<{}, [
    string,
    number,
    number
]>;
export declare class IndexState<RxDocType> {
    readonly indexId: number;
    readonly index: string[];
    readonly schema: RxJsonSchema<RxDocumentData<RxDocType>>;
    readonly jsonPositionSize: number;
    rows: IndexRow[];
    readonly metaIdMap: MetaIdMap | undefined;
    readonly name: string;
    readonly fileHandle: Promise<AbstractFileSystemFileHandle>;
    readonly getIndexableString: ReturnType<typeof getIndexableStringMonad<RxDocType>>;
    readonly indexableStringLength: number;
    readonly primaryPath: string;
    readonly primaryKeyLength: number;
    readonly indexFile: IndexFile;
    constructor(indexId: number, index: string[], dirHandlePromise: Promise<AbstractFileSystemDirectoryHandle>, schema: RxJsonSchema<RxDocumentData<RxDocType>>, jsonPositionSize: number);
    initRead(runState: TaskQueueRunState<RxDocType>): Promise<void>;
    runChangelogOperation(operation: ChangelogOperation): void;
    /**
     * Run a write operation on the memory state
     * and returns the changelog operations that must be stored
     * and can be used to replay the actions on other instances.
     */
    appendWriteOperations(events: RxStorageChangeEvent<RxDocumentData<RxDocType>>[], dataPointer: [number, number][], changelogOperations: ChangelogOperation[]): ChangelogOperation[];
    changeDocumentPosition(docData: RxDocumentData<RxDocType>, newPosition: [number, number]): ChangelogOperation;
}
export declare function sortByIndexStringComparator<RxDocType>(a: IndexRow, b: IndexRow): 1 | -1;
export declare const INDEX_ROW_ID_LENGTH = 8;
export declare const INDEX_ID_LENGTH = 5;
export declare function getIndexFileName(indexId: number): string;
export declare function getIndexesFromSchema(schema: RxJsonSchema<any>): string[][];
/**
 * Because we often refer to the indexId,
 * the order of the indexes is very important
 * and must be deterministic.
 */
export declare function sortIndexes(indexes: string[][]): string[][];
