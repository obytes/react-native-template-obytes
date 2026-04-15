import { RxStorageInstanceCreationParams, EventBulk, RxDocumentData, RxJsonSchema, RxStorageChangeEvent, RxStorageDefaultCheckpoint, RxStorageInstance, StringKeys, BulkWriteRow, RxConflictResultionTask, RxConflictResultionTaskSolution, RxStorageBulkWriteResponse, RxStorageCountResult, RxStorageQueryResult, PreparedQuery } from 'rxdb/plugins/core';
import { Observable, Subject } from 'rxjs';
import { AbstractFilesystemInstanceCreationOptions, AbstractFilesystemStorageInternals } from './types.js';
import { TaskQueue } from './task-queue.js';
import { RxStorageAbstractFilesystem } from './index.js';
export declare class RxStorageInstanceAbstractFilesystem<RxDocType> implements RxStorageInstance<RxDocType, AbstractFilesystemStorageInternals, AbstractFilesystemInstanceCreationOptions, RxStorageDefaultCheckpoint> {
    readonly storage: RxStorageAbstractFilesystem;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>;
    readonly internals: AbstractFilesystemStorageInternals;
    readonly options: Readonly<AbstractFilesystemInstanceCreationOptions>;
    readonly settings: {};
    readonly databaseInstanceToken: string;
    readonly jsonPositionSize: number;
    readonly primaryPath: StringKeys<RxDocType>;
    readonly changes$: Subject<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>>;
    readonly instanceId: number;
    closed?: Promise<void>;
    taskQueue: TaskQueue<RxDocType>;
    readQueueEntries: any[];
    constructor(storage: RxStorageAbstractFilesystem, databaseName: string, collectionName: string, schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>, internals: AbstractFilesystemStorageInternals, options: Readonly<AbstractFilesystemInstanceCreationOptions>, settings: {}, databaseInstanceToken: string, jsonPositionSize: number);
    bulkWrite(documentWrites: BulkWriteRow<RxDocType>[], context: string): Promise<RxStorageBulkWriteResponse<RxDocType>>;
    findDocumentsById(ids: string[], withDeleted: boolean): Promise<RxDocumentData<RxDocType>[]>;
    query(preparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageQueryResult<RxDocType>>;
    count(preparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageCountResult>;
    getAttachmentData(documentId: string, attachmentId: string, digest: string): Promise<string>;
    getChangedDocumentsSince(limit: number, checkpoint?: RxStorageDefaultCheckpoint | undefined): Promise<{
        documents: RxDocumentData<RxDocType>[];
        checkpoint: RxStorageDefaultCheckpoint;
    }>;
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocType>, RxStorageDefaultCheckpoint>>;
    cleanup(minimumDeletedTime: number): Promise<boolean>;
    close(): Promise<void>;
    remove(): Promise<void>;
    conflictResultionTasks(): Observable<RxConflictResultionTask<RxDocType>>;
    resolveConflictResultionTask(_taskSolution: RxConflictResultionTaskSolution<RxDocType>): Promise<void>;
}
export declare function createAbstractFilesystemStorageInstance<RxDocType>(storage: RxStorageAbstractFilesystem, params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>, settings: {}): Promise<RxStorageInstanceAbstractFilesystem<RxDocType>>;
