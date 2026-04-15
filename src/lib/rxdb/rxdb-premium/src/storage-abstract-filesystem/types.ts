import {
    PreparedQuery,
    getIndexableStringMonad,
    EventBulk,
    RxStorageChangeEvent,
    RxDocumentData
} from 'rxdb/plugins/core';
import { getStorageInstanceInternalState } from './helpers.js';
import { TaskQueue } from './task-queue.js';

export type State = Awaited<ReturnType<typeof getStorageInstanceInternalState>>;
export type AbstractFilesystemStorageInternals = {
    taskQueue: TaskQueue<any>;
    statePromise: Promise<State>;
};
export type AbstractFilesystemInstanceCreationOptions = {};

export type AccessHandles = { [name: string]: FileSystemFileHandle };
export type IndexableStringFns<RxDocType> = Map<string, ReturnType<typeof getIndexableStringMonad<RxDocType>>>;

export type MetaIdMap = Map<string, IndexRow>;


/**
 * Indexes
 */
export type IndexRow = [
    // indexableString
    string,
    // document id
    string,
    // startPos
    number,
    // endPos
    number
];

export type ChangelogOperationKey =
    'A' |   // Add row
    'D' |   // Delete row
    'R'     // Replace row
    ;


/**
 * An operation that was stored on the changelog.
 */
export type ChangelogOperation = [
    // indexId
    number,
    /**
     * RowId on which the operation should run
     */
    number,
    // operationKey
    ChangelogOperationKey,
    // index row
    IndexRow
];


export type BroadcastChannelMessageWriteEvent<RxDocType> = {
    type: 'event',
    eventBulk?: EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, any>;
    changelogOperations: ChangelogOperation[];
    info: any;
}

export type BroadcastChannelMessageChanges = {
    type: 'pre-write';
    mightHaveUnprocessedChanges: boolean;
}

export type BroadcastChannelMessage<RxDocType> = BroadcastChannelMessageWriteEvent<RxDocType> | BroadcastChannelMessageChanges;
