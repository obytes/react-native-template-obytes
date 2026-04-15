import { RxStorageInstanceCreationParams, EventBulk, RxStorageChangeEvent } from 'rxdb/plugins/core';
import { BroadcastChannelMessage, ChangelogOperation, IndexRow, AbstractFilesystemInstanceCreationOptions, State } from './types.js';
import { TaskQueue } from './task-queue.js';
import { IndexState } from './index-state.js';
import { Subject } from 'rxjs';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { AbstractFilesystem } from './abstract-filesystem.js';
/**
 * Notice that initial page load is very important for RxDB.
 * Therefore we do everything here lazy if possible
 * and we only return the promises.
 */
export declare function getStorageInstanceInternalState<RxDocType>(abstractFilesystem: AbstractFilesystem, params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>, taskQueue: TaskQueue<RxDocType>, jsonPositionSize: number): Promise<{
    params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>;
    taskQueue: TaskQueue<RxDocType>;
    indexStates: IndexState<RxDocType>[];
    primaryPath: "_deleted" | "_attachments" | "_rev" | "_meta" | Extract<keyof RxDocType, string>;
    primaryKeyLength: number;
    root: import("./abstract-filesystem.js").AbstractFileSystemDirectoryHandle;
    dirHandle: import("./abstract-filesystem.js").AbstractFileSystemDirectoryHandle;
    changesFileHandle: import("./abstract-filesystem.js").AbstractFileSystemFileHandle;
    documentFileHandle: import("./abstract-filesystem.js").AbstractFileSystemFileHandle;
    changelogFile: import("./changelog.js").ChangelogFile;
    maxIndexableStringLength: number;
    broadcastChannel: BroadcastChannel | undefined;
    broadcastChannelMessages$: Subject<BroadcastChannelMessage<RxDocType>>;
    /**
     * Flag here if there might be unprocessed changes at the change.json
     */
    mightHaveUnprocessedChanges: boolean;
}>;
export declare function toPaddedString(value: number | string, size: number): string;
/**
 * Atm this value is set to 8 which means the limit
 * is 99999999 Bytes = 99.999999 MB which is way to low.
 * TODO in the next major release, we want to store up to gigabytes of data
 * so we set the value to 14 because 99999999999999 bytes is 99999 Gigabytes
 * which is 99 Terabytes.
 */
export declare const DEFAULT_DOC_JSON_POSITION_SIZE = 8;
export declare function getDirectoryPath(args: {
    databaseName: string;
    collectionName: string;
    schemaVersion: number;
}): string;
export declare function getTotalDocumentCount(state: State): number;
export declare function compareIndexRows(a: IndexRow, b: IndexRow): 1 | 0 | -1;
/**
 * Notify the other instance about the required changelogOperations
 * that must run on the in-memory index-states.
 */
export declare function broadcastChangelogOperations<RxDocType>(storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>, state: State, changelogOperations: ChangelogOperation[], eventBulk?: EventBulk<RxStorageChangeEvent<any>, any>): void;
