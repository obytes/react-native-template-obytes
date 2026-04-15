import { RxJsonSchema, RxStorageInstanceCreationParams, RxStorageInstance, EventBulk, RxStorageChangeEvent, RxDocumentData, BulkWriteRow, RxStorageBulkWriteResponse, RxStorageQueryResult, StringKeys, RxConflictResultionTask, RxConflictResultionTaskSolution, RxStorageDefaultCheckpoint, RxStorageCountResult, PreparedQuery } from 'rxdb/plugins/core';
import { Observable } from 'rxjs';
import type { RxStorageSQLite } from './index.js';
import type { SQLiteBasics, SQLiteInstanceCreationOptions, SQLiteInternals, SQLiteQueryWithParams, SQLiteStorageSettings } from './sqlite-types.js';
export declare class RxStorageInstanceSQLite<RxDocType> implements RxStorageInstance<RxDocType, SQLiteInternals, SQLiteInstanceCreationOptions, RxStorageDefaultCheckpoint> {
    readonly storage: RxStorageSQLite;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>;
    readonly internals: SQLiteInternals;
    readonly options: Readonly<SQLiteInstanceCreationOptions>;
    readonly settings: SQLiteStorageSettings;
    readonly tableName: string;
    readonly devMode: boolean;
    readonly primaryPath: StringKeys<RxDocType>;
    private changes$;
    readonly instanceId: number;
    closed?: Promise<void>;
    sqliteBasics: SQLiteBasics<any>;
    constructor(storage: RxStorageSQLite, databaseName: string, collectionName: string, schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>, internals: SQLiteInternals, options: Readonly<SQLiteInstanceCreationOptions>, settings: SQLiteStorageSettings, tableName: string, devMode: boolean);
    run(db: any, queryWithParams: SQLiteQueryWithParams): Promise<void>;
    all(db: any, queryWithParams: SQLiteQueryWithParams): Promise<{
        id: string;
        data: string;
    }[]>;
    /**
     * @link https://medium.com/@JasonWyatt/squeezing-performance-from-sqlite-insertions-971aff98eef2
     */
    bulkWrite(documentWrites: BulkWriteRow<RxDocType>[], context: string): Promise<RxStorageBulkWriteResponse<RxDocType>>;
    query(originalPreparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageQueryResult<RxDocType>>;
    count(originalPreparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageCountResult>;
    findDocumentsById(ids: string[], withDeleted: boolean): Promise<RxDocumentData<RxDocType>[]>;
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>>;
    cleanup(minimumDeletedTime: number): Promise<boolean>;
    getAttachmentData(documentId: string, attachmentId: string): Promise<string>;
    remove(): Promise<void>;
    close(): Promise<void>;
    conflictResultionTasks(): Observable<RxConflictResultionTask<RxDocType>>;
    resolveConflictResultionTask(taskSolution: RxConflictResultionTaskSolution<RxDocType>): Promise<void>;
}
export declare function createSQLiteStorageInstance<RxDocType>(storage: RxStorageSQLite, params: RxStorageInstanceCreationParams<RxDocType, SQLiteInstanceCreationOptions>, settings: SQLiteStorageSettings): Promise<RxStorageInstanceSQLite<RxDocType>>;
