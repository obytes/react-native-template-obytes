import { TaskQueueRunState } from './task-queue.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { IndexState } from './index-state.js';
export declare function cleanup<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, runState: TaskQueueRunState<RxDocType>, minimumDeletedTime: number): Promise<boolean>;
/**
 * Returns the ids of the purged documents
 */
export declare function cleanupDeletedDocuments<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, runState: TaskQueueRunState<RxDocType>, minimumDeletedTime: number): Promise<string[]>;
/**
 * Returns the index states that had a write during the cleanup
 */
export declare function cleanupChangelogOperations<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, runState: TaskQueueRunState<RxDocType>): Promise<IndexState<RxDocType>[]>;
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
export declare function cleanupDocumentJsonFile<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, runState: TaskQueueRunState<RxDocType>): Promise<number>;
