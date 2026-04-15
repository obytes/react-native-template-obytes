import { PreparedQuery, RxDocumentData } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
/**
 * There are different modes of querying.
 * -    One is when we need the queryMatcher to check if the
 *      row must be in the query result. -> we must fully load the docData
 * -    The other is when we do not need a queryMatcher
 *      and we can determine the result rows only by using the index.
 */
export declare function abstractFilesystemQuery<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, preparedQuery: PreparedQuery<RxDocType>, runState: TaskQueueRunState<RxDocType>): Promise<string | {
    documents: RxDocumentData<RxDocType>[];
}>;
