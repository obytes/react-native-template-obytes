import { BulkWriteRow, RxStorageInstance } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
import { State } from './types.js';
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
export declare function bulkWrite<RxDocType>(runState: TaskQueueRunState<RxDocType>, storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>, documentWrites: BulkWriteRow<RxDocType>[], context: string): Promise<Awaited<ReturnType<RxStorageInstance<any, any, any>['bulkWrite']>>>;
/**
 * This funtion ensure all changes from the changes.json
 * have been processed.
 * It must run at the start of each Task from the TaskQueue.
 * Also this must be idempotent so that when the JavaScript
 * process crashes at any point of the function call,
 * it must be able to recover from that state at the next call.
 */
export declare function processChangesFileIfRequired<RxDocType>(runState: TaskQueueRunState<RxDocType>, state: State, storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>, noEmit?: boolean): Promise<void>;
