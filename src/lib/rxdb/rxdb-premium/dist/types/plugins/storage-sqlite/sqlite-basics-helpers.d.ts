import type { Sqlite3Type, SQLiteBasics, SQLiteDatabaseClass, SQLiteQueryWithParams } from './sqlite-types.js';
export declare function getSQLiteBasicsNode(sqlite3: Sqlite3Type): SQLiteBasics<SQLiteDatabaseClass>;
/**
 * Promisified version of db.run()
 */
export declare function execSqlSQLiteNode(database: SQLiteDatabaseClass, queryWithParams: SQLiteQueryWithParams, operator: 'run' | 'all'): any;
export declare function closeSQLiteDatabaseNode(database: SQLiteDatabaseClass): Promise<void>;
type SQLiteCapacitorDatabase = any;
type SQLiteConnection = any;
export declare function getSQLiteBasicsCapacitor(sqlite: SQLiteConnection, capacitorCore: any): SQLiteBasics<SQLiteCapacitorDatabase>;
type SQLiteQuickDatabase = any;
export declare const EMPTY_FUNCTION: () => void;
export declare function getSQLiteBasicsQuickSQLite(openDB: any): SQLiteBasics<SQLiteQuickDatabase>;
export declare function getSQLiteBasicsExpoSQLite(openDB: any): SQLiteBasics<any>;
/**
 * Build to be compatible with packages
 * that use the websql npm package like:
 * @link https://www.npmjs.com/package/react-native-sqlite-2
 * @link https://www.npmjs.com/package/websql
 * Use like:
 * import SQLite from 'react-native-sqlite-2';
 * getRxStorageSQLite({
 *   sqliteBasics: getSQLiteBasicsWebSQL(SQLite.openDatabase)
 * });
 *
 */
export declare function getSQLiteBasicsWebSQL(openDB: any): SQLiteBasics<any>;
export declare function webSQLExecuteQuery(db: any, queryWithParams: SQLiteQueryWithParams): Promise<any>;
export { };
