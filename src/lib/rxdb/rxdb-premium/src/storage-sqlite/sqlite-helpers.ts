import {
    BulkWriteRow,
    RxDocumentData,
    PROMISE_RESOLVE_VOID,
    promiseWait,
    errorToPlainJson,
    RxJsonSchema,
    FilledMangoQuery,
    getPrimaryFieldOfPrimaryKey,
    clone
} from 'rxdb/plugins/core';
import type {
    SQLiteBasics,
    SQLiteDatabaseClass,
    SQLitePreparedQuery,
    SQLiteQueryWithParams
} from './sqlite-types.js';
import { mangoQuerySelectorToSQL, mangoQuerySortToSQL } from './sqlite-query.js';
import { RxStorageInstanceSQLite } from './sqlite-storage-instance.js';

export const NON_IMPLEMENTED_OPERATOR_QUERY_BATCH_SIZE = 50;

declare type DatabaseState = {
    database: Promise<SQLiteDatabaseClass>;
    openConnections: number;
    sqliteBasics: SQLiteBasics<SQLiteDatabaseClass>;
}
const DATABASE_STATE_BY_NAME: Map<string, DatabaseState> = new Map();

export const RX_STORAGE_NAME_SQLITE = 'sqlite';


/**
 * Running SQL statements with too many variables
 * will throw with:
 * 'SQLITE_ERROR: too many SQL variables'
 */
export const SQLITE_VARIABLES_LIMIT = 999;

export function attachmentRowKey(documentId: string, attachmentId: string): string {
    return documentId + '||' + attachmentId;
}

export function getDatabaseConnection(
    sqliteBasics: SQLiteBasics<any>,
    databaseName: string
): Promise<SQLiteDatabaseClass> {
    let state = DATABASE_STATE_BY_NAME.get(databaseName);
    if (!state) {
        state = {
            database: sqliteBasics
                .open(databaseName)
                /**
                 * Pragmas must be re-set on
                 * each new database connection
                 */
                .then(async (db) => {
                    if (sqliteBasics.journalMode) {
                        await sqliteBasics.setPragma(db, 'journal_mode', sqliteBasics.journalMode);
                    }

                    /**
                     * Running optimization pragmas
                     * caused too many errors.
                     * TODO In the future we should add more test to ensure
                     * everything works in the different environments
                     * and then we can enable these pragmas again.
                     */
                    // // must run first because it cannot run while other pragma is running
                    // await sqliteBasics.setPragma(db, 'synchronous', 'normal');
                    // await Promise.all([
                    //     /**
                    //      * @link https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
                    //      */
                    //     sqliteBasics.setPragma(db, 'page_size', '32768'),
                    //     // sqliteBasics.setPragma(db, 'mmap_size', '20000000000'), // DO NOT USE mmap_size, it is broken on capacitor android.
                    //     sqliteBasics.journalMode ?
                    //         sqliteBasics.setPragma(db, 'journal_mode', sqliteBasics.journalMode) :
                    //         PROMISE_RESOLVE_VOID
                    // ]);
                    return db;
                }),
            sqliteBasics,
            openConnections: 1
        };
        DATABASE_STATE_BY_NAME.set(databaseName, state);
    } else {
        if (state.sqliteBasics !== sqliteBasics) {
            throw new Error('opened db with different creator method ' + databaseName);
        }
        state.openConnections = state.openConnections + 1;
    }
    return state.database;
}

export async function closeDatabaseConnection(
    databaseName: string,
    sqliteBasics: SQLiteBasics<any>
): Promise<void> {
    const state = DATABASE_STATE_BY_NAME.get(databaseName);
    if (state) {
        state.openConnections = state.openConnections - 1;
        if (state.openConnections === 0) {
            DATABASE_STATE_BY_NAME.delete(databaseName);
            return state.database.then(db => sqliteBasics.close(db));
        }
    }
}


const INDEX_JOIN_CHAR = '_';

/**
 * Creates the identifier of an index.
 * Ensures to be a safe index name that works with SQLite.
 * Notice that multiple collections can have the same index
 * and it must calculate a different indexId for that
 * otherwise the "create if not exists" will detect that this index exists already.
 */
export function getIndexId(
    databaseName: string,
    collectionName: string,
    schema: RxJsonSchema<any>,
    index: string[] | readonly string[],
): string {
    const safeArray = index.map(indexPart => {
        return indexPart.replace(/\./g, INDEX_JOIN_CHAR + 'dot' + INDEX_JOIN_CHAR);
    });

    const prefix = [
        databaseName,
        collectionName,
        schema.version
    ].join(INDEX_JOIN_CHAR);

    const indexId = 'rxdb' + prefix + INDEX_JOIN_CHAR + safeArray.join(INDEX_JOIN_CHAR) + INDEX_JOIN_CHAR + 'idx';
    return indexId;
}


export function getSQLiteInsertSQL<RxDocType>(
    collectionName: string,
    primaryPath: keyof RxDocType,
    docData: RxDocumentData<RxDocType>
): SQLiteQueryWithParams {
    // language=SQL
    const query = `
        INSERT INTO ${collectionName}(
            id,
            revision,
            deleted,
            lastWriteTime,
            data
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            json(?)
        );
    `;
    const params = [
        docData[primaryPath] as string,
        docData._rev,
        docData._deleted ? 1 : 0,
        docData._meta.lwt,
        JSON.stringify(docData)
    ];
    return {
        query,
        params,
        context: {
            method: 'getSQLiteInsertSQL',
            data: {
                collectionName,
                primaryPath
            }
        }
    }
}

export function getSQLiteUpdateSQL<RxDocType>(
    tableName: string,
    primaryPath: keyof RxDocType,
    writeRow: BulkWriteRow<RxDocType>
): SQLiteQueryWithParams {
    const docData = writeRow.document;
    // language=SQL
    const query = `
    UPDATE "${tableName}"
    SET 
        revision = ?,
        deleted = ?,
        lastWriteTime = ?,
        data = json(?)
    WHERE
        id = ?
    `;
    const params = [
        docData._rev,
        docData._deleted ? 1 : 0,
        docData._meta.lwt,
        JSON.stringify(docData),
        docData[primaryPath] as string,
    ];
    return {
        query,
        params,
        context: {
            method: 'getSQLiteUpdateSQL',
            data: {
                tableName,
                primaryPath
            }
        }
    }
};


/**
 * For better performance we use the id field
 * instead of extracting it out of the json if possible.
 */
export function getJsonExtract(
    primaryPath: string,
    key: string
) {
    if (primaryPath === key) {
        return 'id';
    } else if (key === '_meta.lwt') {
        return 'lastWriteTime';
    } else {
        return 'JSON_EXTRACT(data, \'$.' + key + '\')';
    }
}

export function getSQLiteFindByIdSQL<RxDocType>(
    tableName: string,
    docIds: string[],
    withDeleted: boolean
): SQLiteQueryWithParams {
    const deletedSelector = withDeleted ? '' : ' AND deleted = 0';

    // language=SQL
    const query = `
        SELECT * FROM "${tableName}"
        WHERE id IN (${new Array(docIds.length).fill(PARAM_KEY).join(', ')})
        ${deletedSelector};
    `;
    return {
        query,
        params: docIds,
        context: {
            method: 'getSQLiteFindByIdSQL',
            data: {
                tableName,
                docIds
            }
        }
    }
}

export function isPlainObject(o: any): boolean {
    return typeof o == 'object' && o.constructor == Object;
}


const TX_QUEUE_BY_DATABASE: WeakMap<SQLiteDatabaseClass, Promise<void>> = new WeakMap();
export async function sqliteTransaction(
    database: SQLiteDatabaseClass,
    sqliteBasics: SQLiteBasics<any>,
    handler: () => Promise<'COMMIT' | 'ROLLBACK'>,
    /**
     * Context will be logged
     * if the commit does error.
     */
    context?: any
) {
    let queue = TX_QUEUE_BY_DATABASE.get(database);
    if (!queue) {
        queue = PROMISE_RESOLVE_VOID;
    }
    queue = queue.then(async () => {
        await openSqliteTransaction(database, sqliteBasics);
        const handlerResult = await handler();
        await finishSqliteTransaction(database, sqliteBasics, handlerResult, context);
    });
    TX_QUEUE_BY_DATABASE.set(database, queue);
    return queue;
}

/**
 * TODO instead of doing a while loop, we should find a way to listen when the
 * other transaction is comitted.
 */
export async function openSqliteTransaction(
    database: SQLiteDatabaseClass,
    sqliteBasics: SQLiteBasics<any>
) {
    let openedTransaction = false;
    while (!openedTransaction) {
        try {
            await sqliteBasics.run(
                database,
                {
                    query: 'BEGIN;',
                    params: [],
                    context: {
                        method: 'openSqliteTransaction',
                        data: ''
                    }
                }
            );
            openedTransaction = true;
        } catch (err: any) {
            console.log('open transaction error (will retry):');
            console.log(JSON.stringify(errorToPlainJson(err)));
            console.dir(err);
            if (err.message && err.message.includes('Database is closed')) {
                throw err;
            }
            // wait one tick to not fully block the cpu on errors.
            await promiseWait(0);
        }
    }
    return;
}
export function finishSqliteTransaction(
    database: SQLiteDatabaseClass,
    sqliteBasics: SQLiteBasics<any>,
    mode: 'COMMIT' | 'ROLLBACK',
    /**
     * Context will be logged
     * if the commit does error.
     */
    context?: any
) {
    return sqliteBasics.run(
        database,
        {
            query: mode + ';',
            params: [],
            context: {
                method: 'finishSqliteTransaction',
                data: mode
            }
        }
    ).catch(err => {
        if (context) {
            console.error('cannot close transaction (mode: ' + mode + ')');
            console.log(JSON.stringify(context, null, 4));
        }
        throw err;
    });
}


export const PARAM_KEY = '?';


export function ensureParamsCountIsCorrect(queryWithParams: SQLiteQueryWithParams) {
    const paramsCount = queryWithParams.params.length;
    const paramKeyCount = queryWithParams.query.split(PARAM_KEY).length - 1;
    if (paramsCount !== paramKeyCount) {
        throw new Error('ensureParamsCountIsCorrect() wrong param count: ' + JSON.stringify(queryWithParams));
    }
}


export function prepareSQLiteQuery<RxDocType>(
    instance: RxStorageInstanceSQLite<RxDocType>,
    mutateableQuery: FilledMangoQuery<RxDocType>
): SQLitePreparedQuery<RxDocType> {
    const primaryPath = getPrimaryFieldOfPrimaryKey(instance.schema.primaryKey) as any;
    /**
     * If no limit given, we have to set it to -1
     * to ensure OFFSET still works.
     * @link https://stackoverflow.com/a/19676495/3443137
     */
    const limitString = mutateableQuery.limit ? 'LIMIT ' + mutateableQuery.limit : 'LIMIT -1';
    const skipString = mutateableQuery.skip ? 'OFFSET ' + mutateableQuery.skip : '';
    let mutableParams: any[] = [];
    let fullQueryString = '';
    let nonImplementedOperator: string | undefined = undefined;

    let indexedBy: string = '';
    if (mutateableQuery.index) {
        const indexId = getIndexId(instance.databaseName, instance.collectionName, instance.schema, mutateableQuery.index);
        indexedBy = 'INDEXED BY "' + indexId + '"';
    }
    const querySortPart = mangoQuerySortToSQL(primaryPath, mutateableQuery.sort as any);
    try {
        let whereClauseSelector = mangoQuerySelectorToSQL<RxDocType>(
            instance.schema,
            mutateableQuery.selector as any,
            mutableParams
        );
        if (whereClauseSelector !== '()') {
            whereClauseSelector = ' WHERE ' + whereClauseSelector + ' ';
        } else {
            whereClauseSelector = '';
        }

        fullQueryString = indexedBy + ' ' +
            whereClauseSelector +
            querySortPart + ' ' +
            limitString + ' ' +
            skipString + ' ' +
            ';';
    } catch (err: any) {
        if (err.isNonImplementedOperatorError) {
            mutableParams = [];
            nonImplementedOperator = err.operator;
            fullQueryString = indexedBy + ' ' +
                querySortPart + ' ' +
                'LIMIT ' + NON_IMPLEMENTED_OPERATOR_QUERY_BATCH_SIZE + ' ' // TODO use custom batchSize
            ';';
        } else {
            throw err;
        }
    }
    const prepared: SQLitePreparedQuery<RxDocType> = {
        schema: instance.schema,
        mangoQuery: clone(mutateableQuery) as any,
        sqlQuery: {
            query: fullQueryString,
            params: mutableParams,
            context: {
                method: 'prepareQuery',
                data: {}
            }
        },
        queryWithoutSort: fullQueryString.replace(querySortPart, ' '),
        nonImplementedOperator
    };

    return prepared;
}
