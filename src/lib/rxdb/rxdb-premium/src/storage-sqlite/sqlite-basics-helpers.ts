import {
    ensureNotFalsy,
    PROMISE_RESOLVE_VOID,
    getFromMapOrCreate
} from 'rxdb/plugins/core';
import type {
    Sqlite3Type,
    SQLiteBasics,
    SQLiteDatabaseClass,
    SQLiteQueryWithParams
} from './sqlite-types.js';


const BASICS_BY_SQLITE_LIB = new WeakMap();
export function getSQLiteBasicsNode(
    sqlite3: Sqlite3Type
): SQLiteBasics<SQLiteDatabaseClass> {
    let basics: SQLiteBasics<SQLiteDatabaseClass> = BASICS_BY_SQLITE_LIB.get(sqlite3);
    if (!basics) {
        basics = {
            open: (name: string) => Promise.resolve(new sqlite3.Database(name)),
            async run(
                db: SQLiteDatabaseClass,
                queryWithParams: SQLiteQueryWithParams
            ) {
                if (!Array.isArray(queryWithParams.params)) {
                    console.dir(queryWithParams);
                    throw new Error('no params array given for query: ' + queryWithParams.query);
                }
                await execSqlSQLiteNode(
                    db,
                    queryWithParams,
                    'run'
                );
            },
            async all(
                db: SQLiteDatabaseClass,
                queryWithParams: SQLiteQueryWithParams
            ) {
                const result = await execSqlSQLiteNode(
                    db,
                    queryWithParams,
                    'all'
                );
                return result;
            },
            async setPragma(db, key, value) {
                return execSqlSQLiteNode(
                    db,
                    {
                        query: 'PRAGMA ' + key + ' = ' + value,
                        params: [],
                        context: {
                            method: 'setPragma',
                            data: {
                                key,
                                value
                            }
                        }
                    },
                    'run'
                );
            },
            close(db: SQLiteDatabaseClass) {
                return closeSQLiteDatabaseNode(db);
            },
            journalMode: 'WAL2'
        };
        BASICS_BY_SQLITE_LIB.set(sqlite3, basics);
    }
    return basics;
}

/**
 * Promisified version of db.run()
 */
export function execSqlSQLiteNode(
    database: SQLiteDatabaseClass,
    queryWithParams: SQLiteQueryWithParams,
    operator: 'run' | 'all'
): any {
    let debug = false;
    let resolved = false;
    return new Promise((res, rej) => {
        if (debug) {
            console.log('# execSqlSQLiteNode() ' + queryWithParams.query);
        }
        database[operator](
            queryWithParams.query,
            queryWithParams.params,
            ((err: any, result: any) => {
                if (resolved) {
                    throw new Error('callback called mutliple times ' + queryWithParams.query);
                }
                resolved = true;
                if (err) {
                    if (debug) {
                        console.log('---- ERROR RUNNING SQL:');
                        console.log(queryWithParams.query);
                        console.dir(queryWithParams.params);
                        console.dir(err);
                        console.log('----');
                    }
                    rej(err);
                } else {
                    if (debug) {
                        console.log('execSql() result: ' + database.eventNames());
                        console.log(queryWithParams.query);
                        console.dir(result);
                        console.log('execSql() result:');
                        console.log(queryWithParams.query);
                        console.dir(queryWithParams.params);
                        console.log('execSql() result -------------------------');
                    }
                    res(result);
                }
            })
        );
    });
}


export function closeSQLiteDatabaseNode(
    database: SQLiteDatabaseClass
): Promise<void> {
    return new Promise((res, rej) => {
        let resolved = false;
        database.close((err: any) => {
            if (resolved) {
                throw new Error('close() callback called mutliple times');
            }
            resolved = true;
            if (
                err &&
                !err.message.includes('Database is closed')
            ) {
                rej(err);
            } else {
                res();
            }
        });
    });
}








type SQLiteCapacitorDatabase = any;
type SQLiteConnection = any;

const BASICS_BY_SQLITE_LIB_CAPACITOR: WeakMap<SQLiteConnection, SQLiteBasics<SQLiteCapacitorDatabase>> = new WeakMap();
const CAPACITOR_CONNECTION_BY_NAME = new Map();
/**
 * In capacitor it is not allowed to reopen an already
 * open database connection. So we have to queue the open-close
 * calls so that they do not run in parallel and we do not open&close
 * database connections at the same time.
 */
let capacitorOpenCloseQueue = PROMISE_RESOLVE_VOID;

export function getSQLiteBasicsCapacitor(
    sqlite: SQLiteConnection,
    capacitorCore: any
): SQLiteBasics<SQLiteCapacitorDatabase> {
    const basics = getFromMapOrCreate<SQLiteConnection, SQLiteBasics<SQLiteCapacitorDatabase>>(
        BASICS_BY_SQLITE_LIB_CAPACITOR,
        sqlite,
        () => {
            const innerBasics: SQLiteBasics<SQLiteCapacitorDatabase> = {
                open(dbName: string) {
                    capacitorOpenCloseQueue = capacitorOpenCloseQueue.then(async () => {
                        const db = await getFromMapOrCreate(
                            CAPACITOR_CONNECTION_BY_NAME,
                            dbName,
                            () => sqlite.createConnection(dbName, false, 'no-encryption', 1)
                        );
                        await db.open();
                        return db;
                    });
                    return capacitorOpenCloseQueue;
                },
                async run(
                    db: SQLiteCapacitorDatabase,
                    queryWithParams: SQLiteQueryWithParams
                ) {
                    await db.run(
                        queryWithParams.query,
                        queryWithParams.params,
                        false
                    );
                },
                async all(
                    db: SQLiteCapacitorDatabase,
                    queryWithParams: SQLiteQueryWithParams
                ) {
                    const result: any = await db.query(
                        queryWithParams.query,
                        queryWithParams.params
                    );
                    return ensureNotFalsy(result.values);
                },
                async setPragma(db, key, value) {
                    return db.execute('PRAGMA ' + key + ' = ' + value, false);
                },
                close(db: SQLiteCapacitorDatabase) {
                    capacitorOpenCloseQueue = capacitorOpenCloseQueue.then(() => {
                        return db.close();
                    });
                    return capacitorOpenCloseQueue;
                },
                /**
                 * On android, there is already WAL mode set.
                 * So we do not have to set it by our own.
                 * @link https://github.com/capacitor-community/sqlite/issues/258#issuecomment-1102966087
                 */
                journalMode: capacitorCore.getPlatform() === 'android' ? '' : 'WAL'
            };
            return innerBasics;
        }
    );
    return basics;
}





type SQLiteQuickDatabase = any;
type SQLiteQuickConnection = any;
export const EMPTY_FUNCTION = () => { };

export function getSQLiteBasicsQuickSQLite(
    openDB: any
): SQLiteBasics<SQLiteQuickDatabase> {
    return {
        open: async (name: string) => {
            return openDB(
                { name }
            );
        },
        all: async (db: SQLiteQuickConnection, queryWithParams: SQLiteQueryWithParams) => {
            const result = await db.executeAsync(
                queryWithParams.query,
                queryWithParams.params
            );
            return result.rows._array;
        },
        run: async (db: SQLiteQuickConnection, queryWithParams: SQLiteQueryWithParams) => {
            return db.executeAsync(
                queryWithParams.query,
                queryWithParams.params
            );
        },
        async setPragma(db, key, value) {
            return db.executeAsync(
                'PRAGMA ' + key + ' = ' + value,
                []
            );
        },
        close: async (db: SQLiteQuickConnection) => {
            db.close(
                EMPTY_FUNCTION,
                EMPTY_FUNCTION,
            )
        },
        journalMode: '',
    };
}




export function getSQLiteBasicsExpoSQLite(
    openDB: any,
): SQLiteBasics<any> {
    return {
        open: async (name: string) => {
            return Promise.resolve(openDB(name));
        },
        all: async (db: any, queryWithParams: SQLiteQueryWithParams) => {
            const result = new Promise<any>((resolve, reject) => {
                db.exec(
                    [{ sql: queryWithParams.query, args: queryWithParams.params }],
                    false,
                    (err: any, res: any) => {
                        if (err) {
                            return reject(err);
                        }
                        if (Array.isArray(res)) {
                            const queryResult = res[0]; // there is only one query
                            if (Object.prototype.hasOwnProperty.call(queryResult, 'rows')) {
                                return resolve(queryResult.rows);
                            }
                            return reject(queryResult.error);
                        }
                        return reject(new Error(`getSQLiteBasicsExpoSQLite.all() response is not an array: ${res}`));
                    }
                );
            });
            return result;
        },
        run: async (db: any, queryWithParams: SQLiteQueryWithParams) => {
            return new Promise<any>((resolve, reject) => {
                db.exec([{ sql: queryWithParams.query, args: queryWithParams.params }], false, (err: any, res: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (Array.isArray(res) && res[0] && res[0].error) {
                        return reject(res);
                    } else {
                        resolve(res);
                    };
                });
            });
        },
        setPragma(db, key, value) {
            return new Promise<any>((resolve, reject) => {
                db.exec([{ sql: `pragma ${key} = ${value};`, args: [] }], false, (err: any, res: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (Array.isArray(res) && res[0] && res[0].error) {
                        return reject(res);
                    } else {
                        resolve(res);
                    };
                });
            });
        },
        close: async (db: any) => {
            return db.closeAsync();
        },
        journalMode: '',
    };
};





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
export function getSQLiteBasicsWebSQL(
    openDB: any,
): SQLiteBasics<any> {
    return {
        open: async (name: string) => {
            const webSQLDatabase = await openDB(name, '1.0', '', 1);
            return ensureNotFalsy(webSQLDatabase._db);
        },
        all: async (db: any, queryWithParams: SQLiteQueryWithParams) => {
            const rawResult = await webSQLExecuteQuery(db, queryWithParams);
            const rows = Array.from(rawResult.rows);
            return rows as any;
        },
        run: async (db: any, queryWithParams: SQLiteQueryWithParams) => {
            await webSQLExecuteQuery(db, queryWithParams);
        },
        setPragma: async (db, key, value) => {
            await webSQLExecuteQuery(db, {
                query: `pragma ${key} = ${value};`,
                params: [],
                context: {
                    method: 'setPragma',
                    data: {
                        key,
                        value
                    }
                }
            }).catch(err => {
                /**
                 * WebSQL in the browser does not allow us to set any pragma
                 * so we have to catch the error.
                 * @link https://stackoverflow.com/a/10298712/3443137
                 */
                if (err.message.includes('23 not authorized')) {
                    return;
                }
                throw err;
            });
        },
        close: async (db: any) => {
            /**
             * The WebSQL API itself has no close() method.
             * But some libraries have different custom close methods.
             */
            if (typeof db.closeAsync === 'function') {
                return db.closeAsync();
            }
            if (typeof db.close === 'function') {
                return db.close();
            }
        },
        journalMode: '',
    };
};

export function webSQLExecuteQuery(
    db: any,
    queryWithParams: SQLiteQueryWithParams
): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        db.exec(
            [{ sql: queryWithParams.query, args: queryWithParams.params }],
            false,
            (err: any, res: any) => {
                if (err) {
                    return reject(err);
                }
                if (Array.isArray(res) && res[0] && res[0].error) {
                    return reject(res[0].error);
                } else {
                    return resolve(res[0]);
                };
            }
        );
    });
}
