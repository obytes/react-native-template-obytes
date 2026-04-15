import { BulkWriteRow, RxDocumentData, RxJsonSchema, FilledMangoQuery } from 'rxdb/plugins/core';
import type { SQLiteBasics, SQLiteDatabaseClass, SQLitePreparedQuery, SQLiteQueryWithParams } from './sqlite-types.js';
import { RxStorageInstanceSQLite } from './sqlite-storage-instance.js';
export declare const NON_IMPLEMENTED_OPERATOR_QUERY_BATCH_SIZE = 50;
export declare const RX_STORAGE_NAME_SQLITE = "sqlite";
/**
 * Running SQL statements with too many variables
 * will throw with:
 * 'SQLITE_ERROR: too many SQL variables'
 */
export declare const SQLITE_VARIABLES_LIMIT = 999;
export declare function attachmentRowKey(documentId: string, attachmentId: string): string;
export declare function getDatabaseConnection(sqliteBasics: SQLiteBasics<any>, databaseName: string): Promise<SQLiteDatabaseClass>;
export declare function closeDatabaseConnection(databaseName: string, sqliteBasics: SQLiteBasics<any>): Promise<void>;
/**
 * Creates the identifier of an index.
 * Ensures to be a safe index name that works with SQLite.
 * Notice that multiple collections can have the same index
 * and it must calculate a different indexId for that
 * otherwise the "create if not exists" will detect that this index exists already.
 */
export declare function getIndexId(databaseName: string, collectionName: string, schema: RxJsonSchema<any>, index: string[] | readonly string[]): string;
export declare function getSQLiteInsertSQL<RxDocType>(collectionName: string, primaryPath: keyof RxDocType, docData: RxDocumentData<RxDocType>): SQLiteQueryWithParams;
export declare function getSQLiteUpdateSQL<RxDocType>(tableName: string, primaryPath: keyof RxDocType, writeRow: BulkWriteRow<RxDocType>): SQLiteQueryWithParams;
/**
 * For better performance we use the id field
 * instead of extracting it out of the json if possible.
 */
export declare function getJsonExtract(primaryPath: string, key: string): string;
export declare function getSQLiteFindByIdSQL<RxDocType>(tableName: string, docIds: string[], withDeleted: boolean): SQLiteQueryWithParams;
export declare function isPlainObject(o: any): boolean;
export declare function sqliteTransaction(database: SQLiteDatabaseClass, sqliteBasics: SQLiteBasics<any>, handler: () => Promise<'COMMIT' | 'ROLLBACK'>,
  /**
   * Context will be logged
   * if the commit does error.
   */
  context?: any): Promise<void>;
/**
 * TODO instead of doing a while loop, we should find a way to listen when the
 * other transaction is comitted.
 */
export declare function openSqliteTransaction(database: SQLiteDatabaseClass, sqliteBasics: SQLiteBasics<any>): Promise<void>;
export declare function finishSqliteTransaction(database: SQLiteDatabaseClass, sqliteBasics: SQLiteBasics<any>, mode: 'COMMIT' | 'ROLLBACK',
  /**
   * Context will be logged
   * if the commit does error.
   */
  context?: any): Promise<void>;
export declare const PARAM_KEY = "?";
export declare function ensureParamsCountIsCorrect(queryWithParams: SQLiteQueryWithParams): void;
export declare function prepareSQLiteQuery<RxDocType>(instance: RxStorageInstanceSQLite<RxDocType>, mutateableQuery: FilledMangoQuery<RxDocType>): SQLitePreparedQuery<RxDocType>;
