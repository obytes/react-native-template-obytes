import { RxDocumentData } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
export declare function findDocumentsByIds<RxDocType>(storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>, docIds: string[], withDeleted: boolean, runState: TaskQueueRunState<RxDocType>): Promise<string>;
export declare function findDocumentsByIdsInternal<RxDocType>(storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>, docIds: string[], runState: TaskQueueRunState<RxDocType>): Promise<Map<string, RxDocumentData<RxDocType>>>;
