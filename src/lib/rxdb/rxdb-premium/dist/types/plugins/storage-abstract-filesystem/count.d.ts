import { PreparedQuery, RxStorageCountResult } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
export declare function abstractFilesystemCount<RxDocType>(instance: RxStorageInstanceAbstractFilesystem<RxDocType>, preparedQuery: PreparedQuery<RxDocType>, runState: TaskQueueRunState<RxDocType>): Promise<RxStorageCountResult>;
