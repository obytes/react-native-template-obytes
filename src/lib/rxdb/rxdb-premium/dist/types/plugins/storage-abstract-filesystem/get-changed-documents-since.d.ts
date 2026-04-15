import { RxDocumentData, RxStorageDefaultCheckpoint } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
export declare function getChangedDocumentsSince<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, runState: TaskQueueRunState<RxDocType>, limit: number, checkpoint?: RxStorageDefaultCheckpoint): Promise<{
    documents: RxDocumentData<RxDocType>[];
    checkpoint: RxStorageDefaultCheckpoint;
}>;
