import {
    RxJsonSchema,
    RxStorageInstanceCreationParams,
    RxStorageInstance,
    getPrimaryFieldOfPrimaryKey,
    EventBulk,
    RxStorageChangeEvent,
    RxDocumentData,
    BulkWriteRow,
    RxStorageBulkWriteResponse,
    RxStorageQueryResult,
    categorizeBulkWriteRows,
    isMaybeReadonlyArray,
    ensureNotFalsy,
    sortDocumentsByLastWriteTime,
    StringKeys,
    addRxStorageMultiInstanceSupport,
    RxConflictResultionTask,
    RxConflictResultionTaskSolution,
    PROMISE_RESOLVE_VOID,
    RxStorageDefaultCheckpoint,
    lastOfArray,
    CategorizeBulkWriteRowsOutput,
    getFromMapOrThrow,
    RxStorageCountResult,
    promiseWait,
    getQueryMatcher,
    batchArray,
    now,
    PreparedQuery
} from 'rxdb/plugins/core';
import { Observable, Subject } from 'rxjs';
import type { RxStorageSQLite } from './index.js';
import {
    attachmentRowKey,
    closeDatabaseConnection,
    ensureParamsCountIsCorrect,
    getDatabaseConnection,
    getIndexId,
    getJsonExtract,
    getSQLiteFindByIdSQL,
    getSQLiteUpdateSQL,
    RX_STORAGE_NAME_SQLITE,
    sqliteTransaction,
    SQLITE_VARIABLES_LIMIT,
    prepareSQLiteQuery
} from './sqlite-helpers.js';
import type {
    SQLiteBasics,
    SQLiteChangesCheckpoint,
    SQLiteInstanceCreationOptions,
    SQLiteInternals,
    SQLitePreparedQuery,
    SQLiteQueryWithParams,
    SQLiteStorageSettings
} from './sqlite-types.js';

let instanceId = 0;
export class RxStorageInstanceSQLite<RxDocType> implements RxStorageInstance<
    RxDocType,
    SQLiteInternals,
    SQLiteInstanceCreationOptions,
    RxStorageDefaultCheckpoint
> {
    public readonly primaryPath: StringKeys<RxDocType>;
    private changes$: Subject<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>> = new Subject();
    public readonly instanceId = instanceId++;
    public closed?: Promise<void>;

    public sqliteBasics: SQLiteBasics<any>;

    constructor(
        public readonly storage: RxStorageSQLite,
        public readonly databaseName: string,
        public readonly collectionName: string,
        public readonly schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>,
        public readonly internals: SQLiteInternals,
        public readonly options: Readonly<SQLiteInstanceCreationOptions>,
        public readonly settings: SQLiteStorageSettings,
        public readonly tableName: string,
        public readonly devMode: boolean
    ) {
        this.sqliteBasics = storage.settings.sqliteBasics;
        this.primaryPath = getPrimaryFieldOfPrimaryKey(this.schema.primaryKey) as any;
    }


    run(
        db: any,
        queryWithParams: SQLiteQueryWithParams
    ) {
        if (this.devMode) {
            ensureParamsCountIsCorrect(queryWithParams);
        }
        return this.sqliteBasics.run(db, queryWithParams);
    }
    all(
        db: any,
        queryWithParams: SQLiteQueryWithParams
    ) {
        if (this.devMode) {
            ensureParamsCountIsCorrect(queryWithParams);
        }
        return this.sqliteBasics.all(db, queryWithParams);
    }

    /**
     * @link https://medium.com/@JasonWyatt/squeezing-performance-from-sqlite-insertions-971aff98eef2
     */
    async bulkWrite(
        documentWrites: BulkWriteRow<RxDocType>[],
        context: string
    ): Promise<RxStorageBulkWriteResponse<RxDocType>> {
        const database = await this.internals.databasePromise;
        const ret: RxStorageBulkWriteResponse<RxDocType> = {
            success: [],
            error: []
        };
        const writePromises: Promise<any>[] = [];
        const allCategorized: CategorizeBulkWriteRowsOutput<RxDocType>[] = [];

        /**
         * Doing all writes in a single sql statement could
         * throw with a 'too many variables' error, so we have to batch the writes.
         */
        const variablesPerWriteRow = 5;
        const writeVariablesBlock = '(' + new Array(variablesPerWriteRow).fill('?').join(', ') + ')';
        const writeBatchSize = SQLITE_VARIABLES_LIMIT / variablesPerWriteRow;
        const writeBatches = batchArray(documentWrites, writeBatchSize);

        await sqliteTransaction(
            database,
            this.sqliteBasics,
            async () => {
                if (this.closed) {
                    throw new Error('SQLite.bulkWrite() already closed ' + this.tableName + ' context: ' + context);
                }
                await Promise.all(
                    writeBatches.map(async (writeBatch) => {
                        const documentKeys: string[] = writeBatch.map(writeRow => writeRow.document[this.primaryPath] as any);
                        const result = await this.all(
                            database,
                            {
                                query: `
                                    SELECT data FROM "${this.tableName}" WHERE id IN (${documentKeys.map(() => '?').join(', ')})
                                `,
                                params: documentKeys,
                                context: {
                                    method: 'bulkWrite',
                                    data: documentWrites
                                }
                            }
                        );

                        const docsInDb: Map<RxDocumentData<RxDocType>[StringKeys<RxDocType>], RxDocumentData<RxDocType>> = new Map();
                        result.forEach(docSQLResult => {
                            const doc = JSON.parse(docSQLResult.data);
                            const id = doc[this.primaryPath];
                            docsInDb.set(id, doc);
                        });
                        const categorized = categorizeBulkWriteRows(
                            this,
                            this.primaryPath,
                            docsInDb,
                            writeBatch,
                            context
                        );
                        allCategorized.push(categorized);
                        ret.error = categorized.errors;


                        const newDocStateById: Map<string, RxDocumentData<RxDocType>> = new Map();
                        if (categorized.bulkInsertDocs.length > 0) {
                            // language=SQL
                            const insertQuery = `INSERT INTO "${this.tableName}"(
                                id,
                                revision,
                                deleted,
                                lastWriteTime,
                                data
                            ) VALUES ${new Array(categorized.bulkInsertDocs.length).fill(writeVariablesBlock).join(', ')};`;
                            const insertParams: any[] = [];
                            categorized.bulkInsertDocs.forEach(row => {
                                const docData = row.document;
                                const docId = (docData as any)[this.primaryPath];
                                newDocStateById.set(docId, docData);
                                insertParams.push(docId);
                                insertParams.push(docData._rev);
                                insertParams.push(docData._deleted ? 1 : 0);
                                insertParams.push(docData._meta.lwt);
                                insertParams.push(JSON.stringify(docData));
                                ret.success.push(docData);
                            });
                            writePromises.push(
                                this.run(
                                    database,
                                    {
                                        query: insertQuery,
                                        params: insertParams,
                                        context: {
                                            method: 'bulkWrite',
                                            data: categorized
                                        }
                                    }
                                )
                            );
                        }
                        if (categorized.bulkUpdateDocs.length > 0) {
                            /**
                             * TODO find a way to bulk upsert instead of running a SQL statement for each row.
                             * @link https://stackoverflow.com/a/15502133/3443137
                             */
                            categorized.bulkUpdateDocs.forEach(writeRow => {
                                const docId = (writeRow.document as any)[this.primaryPath];
                                newDocStateById.set(docId, writeRow.document);
                                ret.success.push(writeRow.document);
                                writePromises.push(
                                    this.run(
                                        database,
                                        getSQLiteUpdateSQL<RxDocType>(this.tableName, this.primaryPath, writeRow)
                                    )
                                );
                            });
                        }


                        categorized.attachmentsAdd.forEach((attachment) => {
                            const insertAttachmentPromise = this.all(
                                database,
                                {
                                    query: `
                                        INSERT INTO
                                            "${this.tableName}_attachments"(
                                                docIdWithAttachmentId,
                                                digest,
                                                length,
                                                type,
                                                data
                                            )
                                        VALUES(?, ?, ?, ?, ?)
                                    `,
                                    params: [
                                        attachmentRowKey(attachment.documentId, attachment.attachmentId),
                                        getFromMapOrThrow(newDocStateById, attachment.documentId)._attachments[attachment.attachmentId].digest,
                                        attachment.attachmentData.length,
                                        attachment.attachmentData.type,
                                        this.storage.base64AttachmentToStoredAttachmentsData(attachment.attachmentData.data)
                                    ],
                                    context: {
                                        method: 'bulkWrite attachmentsAdd',
                                        data: attachment.attachmentId
                                    }
                                }
                            );
                            writePromises.push(insertAttachmentPromise);
                        });
                        categorized.attachmentsRemove.forEach((attachment) => {
                            const insertAttachmentPromise = this.all(
                                database,
                                {
                                    query: `
                                    DELETE FROM
                                        "${this.tableName}_attachments"
                                    WHERE
                                        docIdWithAttachmentId = ?
                                    `,
                                    params: [
                                        attachmentRowKey(attachment.documentId, attachment.attachmentId)
                                    ],
                                    context: {
                                        method: 'bulkWrite attachmentsRemove',
                                        data: attachment.attachmentId
                                    }
                                }
                            );
                            writePromises.push(insertAttachmentPromise);
                        });
                        categorized.attachmentsUpdate.forEach((attachment) => {
                            const insertAttachmentPromise = this.all(
                                database,
                                {
                                    query: `
                                    UPDATE "${this.tableName}_attachments"
                                    SET
                                        digest = ?,
                                        length = ?,
                                        type = ?,
                                        data = ?
                                    WHERE
                                        docIdWithAttachmentId = ?
                                    `,
                                    params: [
                                        getFromMapOrThrow(newDocStateById, attachment.documentId)._attachments[attachment.attachmentId].digest,
                                        attachment.attachmentData.length,
                                        attachment.attachmentData.type,
                                        this.storage.base64AttachmentToStoredAttachmentsData(attachment.attachmentData.data),
                                        attachmentRowKey(attachment.documentId, attachment.attachmentId)
                                    ],
                                    context: {
                                        method: 'bulkWrite attachmentsUpdate',
                                        data: attachment.attachmentId
                                    }
                                }
                            );
                            writePromises.push(insertAttachmentPromise);
                        });
                    })
                );
                await Promise.all(writePromises);

                // close transaction
                if (this.closed) {
                    return 'ROLLBACK';
                }
                return 'COMMIT';
            },
            {
                databaseName: this.databaseName,
                collectionName: this.collectionName
            }
        );

        allCategorized.forEach(categorized => {
            if (categorized.eventBulk.events.length > 0) {
                const lastState = ensureNotFalsy(categorized.newestRow).document;
                categorized.eventBulk.checkpoint = {
                    id: lastState[this.primaryPath],
                    lwt: lastState._meta.lwt
                };
                categorized.eventBulk.endTime = now();
                this.changes$.next(categorized.eventBulk);
            }
        });

        return ret;
    }

    async query(
        originalPreparedQuery: PreparedQuery<RxDocType>
    ): Promise<RxStorageQueryResult<RxDocType>> {
        const preparedQuery = prepareSQLiteQuery(this, originalPreparedQuery.query);

        const database = await this.internals.databasePromise;
        await this.internals.indexCreationPromise;
        if (preparedQuery.nonImplementedOperator) {
            const query = preparedQuery.mangoQuery;
            const skip = query.skip ? query.skip : 0;
            const limit = query.limit ? query.limit : Infinity;
            const skipPlusLimit = skip + limit;
            let result: RxDocumentData<RxDocType>[] = [];
            const queryMatcher = getQueryMatcher(
                this.schema,
                query as any
            );
            let offset = 0;

            let done = false;
            while (done === false) {
                const subResult = await this.all(
                    database,
                    {
                        query: 'SELECT data FROM "' + this.tableName + '" ' + preparedQuery.sqlQuery.query + ' OFFSET ' + offset,
                        params: preparedQuery.sqlQuery.params,
                        context: {
                            method: 'query - bulk iteration',
                            data: preparedQuery
                        }
                    }
                );
                offset = offset + subResult.length;
                subResult.forEach(row => {
                    const docData = JSON.parse(row.data);
                    if (queryMatcher(docData)) {
                        result.push(docData);
                    }
                });
                if (
                    subResult.length === 0 ||
                    result.length >= skipPlusLimit
                ) {
                    done = true;
                }
            }

            result = result.slice(skip, skipPlusLimit);
            return {
                documents: result
            };
        } else {
            const result: any[] = await this.all(
                database,
                {
                    query: 'SELECT data FROM "' + this.tableName + '" ' + preparedQuery.sqlQuery.query,
                    params: preparedQuery.sqlQuery.params,
                    context: {
                        method: 'query - normal',
                        data: preparedQuery
                    }
                }
            );
            return {
                documents: result.map(resultRow => JSON.parse(resultRow.data))
            };
        }
    }
    async count(
        originalPreparedQuery: PreparedQuery<RxDocType>
    ): Promise<RxStorageCountResult> {
        const preparedQuery = prepareSQLiteQuery(this, originalPreparedQuery.query);

        if (preparedQuery.nonImplementedOperator) {
            const queryResult = await this.query(originalPreparedQuery);
            return {
                count: queryResult.documents.length,
                mode: 'slow'
            };
        }

        const database = await this.internals.databasePromise;
        await this.internals.indexCreationPromise;
        const result: any[] = await this.all(
            database,
            {
                /**
                 * @link https://stackoverflow.com/a/4474882/3443137
                 */
                query: 'SELECT COUNT(1) as count FROM "' + this.tableName + '" ' + preparedQuery.queryWithoutSort,
                params: preparedQuery.sqlQuery.params,
                context: {
                    method: 'count',
                    data: preparedQuery
                }
            }
        );
        const firstRow = result[0];
        return {
            count: firstRow.count,
            mode: 'fast'
        };
    }


    async findDocumentsById(
        ids: string[],
        withDeleted: boolean
    ): Promise<RxDocumentData<RxDocType>[]> {
        const database = await this.internals.databasePromise;

        if (this.closed) {
            throw new Error('SQLite.findDocumentsById() already closed ' + this.tableName + ' context: ' + context);
        }

        const result: any[] = await this.all(
            database,
            getSQLiteFindByIdSQL(
                this.tableName,
                ids,
                withDeleted
            )
        );
        const ret: RxDocumentData<RxDocType>[] = [];
        for (let i = 0; i < result.length; ++i) {
            const resultRow = result[i];
            ret.push(JSON.parse(resultRow.data));
        }
        return ret;
    }

    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>> {
        return this.changes$.asObservable();
    }

    async cleanup(minimumDeletedTime: number): Promise<boolean> {
        const database = await this.internals.databasePromise;
        await this.internals.indexCreationPromise;

        /**
         * Purge deleted documents
         */
        const minTimestamp = new Date().getTime() - minimumDeletedTime;
        await this.all(
            database,
            {
                query: `
                    DELETE FROM
                        "${this.tableName}"
                    WHERE
                        deleted = 1
                        AND
                        lastWriteTime < ?
                `,
                params: [
                    minTimestamp
                ],
                context: {
                    method: 'cleanup',
                    data: minimumDeletedTime
                }
            }
        );

        // optimize
        await this.run(
            database,
            {
                query: `pragma optimize;`,
                params: [],
                context: {
                    method: 'cleanup optimize',
                    data: minimumDeletedTime
                }
            }
        );


        return true;
    }

    async getAttachmentData(documentId: string, attachmentId: string): Promise<string> {
        const database = await this.internals.databasePromise;
        const queryString = `
        SELECT data
        FROM "${this.tableName}_attachments"
        WHERE
            docIdWithAttachmentId = ?
        LIMIT 1
        ;`;
        const result: any[] = await this.all(
            database,
            {
                query: queryString,
                params: [
                    attachmentRowKey(documentId, attachmentId)
                ],
                context: {
                    method: 'getAttachmentData',
                    data: attachmentId
                }
            }
        );

        return this.storage.storedAttachmentsDataToBase64(result[0].data);
    }

    async remove(): Promise<void> {
        const database = await this.internals.databasePromise;
        await this.internals.indexCreationPromise;
        const promises = [
            this.run(
                database,
                {
                    query: `DROP TABLE IF EXISTS "${this.tableName}"`,
                    params: [],
                    context: {
                        method: 'remove',
                        data: this.tableName
                    }
                }
            )
        ];
        if (this.schema.attachments) {
            promises.push(
                this.run(
                    database,
                    {
                        query: `DROP TABLE IF EXISTS "${this.tableName}_attachments"`,
                        params: [],
                        context: {
                            method: 'remove attachments',
                            data: this.tableName
                        }
                    }
                )
            );
        }
        await Promise.all(promises);
        return this.close();
    }

    async close(): Promise<void> {
        if (this.closed) {
            return this.closed;
        }
        this.closed = (async () => {
            const database = await this.internals.databasePromise;
            await this.internals.indexCreationPromise;

            /**
             * First get a transaction
             * to ensure currently running operations
             * are finished
             */
            await sqliteTransaction(
                database,
                this.sqliteBasics,
                async () => {
                    return 'COMMIT';
                }
            );
            this.changes$.complete();
            await closeDatabaseConnection(
                this.databaseName,
                this.storage.settings.sqliteBasics
            );
        })();
        return this.closed;

    }


    conflictResultionTasks(): Observable<RxConflictResultionTask<RxDocType>> {
        return new Subject<any>().asObservable();
    }
    resolveConflictResultionTask(taskSolution: RxConflictResultionTaskSolution<RxDocType>): Promise<void> {
        return PROMISE_RESOLVE_VOID;
    }

}

export async function createSQLiteStorageInstance<RxDocType>(
    storage: RxStorageSQLite,
    params: RxStorageInstanceCreationParams<RxDocType, SQLiteInstanceCreationOptions>,
    settings: SQLiteStorageSettings
): Promise<RxStorageInstanceSQLite<RxDocType>> {
    const primaryPath = getPrimaryFieldOfPrimaryKey(params.schema.primaryKey) as any;
    const sqliteBasics = settings.sqliteBasics;
    const tableName = params.collectionName + '-' + params.schema.version;


    const internals: Partial<SQLiteInternals> = {};
    const promises: Promise<any>[] = [];

    internals.databasePromise = getDatabaseConnection(
        storage.settings.sqliteBasics,
        params.databaseName
    ).then(async (database) => {
        await sqliteTransaction(
            database,
            sqliteBasics,
            async () => {
                /**
                 * @link https://www.sqlite.org/withoutrowid.html
                 */
                promises.push(sqliteBasics.run(
                    database,
                    {
                        query: `
                            CREATE TABLE IF NOT EXISTS "${tableName}"(
                                id TEXT NOT NULL PRIMARY KEY,
                                revision TEXT,
                                deleted BOOLEAN NOT NULL CHECK (deleted IN (0, 1)),
                                lastWriteTime INTEGER NOT NULL,
                                data json
                            ) WITHOUT ROWID;
                        `,
                        params: [],
                        context: {
                            method: 'createSQLiteStorageInstance create table',
                            data: params.databaseName
                        }
                    }
                ));

                if (params.schema.attachments) {
                    promises.push(
                        sqliteBasics.run(
                            database,
                            {
                                query: `
                                    CREATE TABLE IF NOT EXISTS "${tableName}_attachments"(
                                        docIdWithAttachmentId TEXT NOT NULL PRIMARY KEY,
                                        digest TEXT NOT NULL,
                                        length INTEGER NOT NULL,
                                        type TEXT NOT NULL,
                                        data BLOB
                                    ) WITHOUT ROWID;
                                `,
                                params: [],
                                context: {
                                    method: 'createSQLiteStorageInstance create attachments table',
                                    data: params.databaseName
                                }
                            }
                        )
                    );
                }
                await Promise.all(promises);
                return 'COMMIT';
            },
            {
                indexCreation: false,
                databaseName: params.databaseName,
                collectionName: params.collectionName
            }
        );
        return database;
    });

    /**
     * Lazy create indexes so that write and read-by-id
     * operations can already run.
     */
    internals.indexCreationPromise = internals.databasePromise
        .then(async (database) => {
            /**
             * Wait one tick here so that more important operations
             * that do not need the indexes, can run already.
             */
            await promiseWait(0);
            await sqliteTransaction(
                database,
                sqliteBasics,
                async () => {
                    const useIndexes: string[][] = !params.schema.indexes ? [] : params.schema.indexes.map(maybeArray => {
                        const index: string[] = isMaybeReadonlyArray(maybeArray) ? maybeArray as any : [maybeArray];
                        return index;
                    });

                    /**
                     * Add the index that is needed for cleanup()
                     */
                    useIndexes.push([
                        'deleted',
                        'lastWriteTime'
                    ]);

                    await Promise.all(
                        useIndexes.map(async (index, a) => {
                            const asArray = isMaybeReadonlyArray(index) ? index : [index];
                            const indexId = getIndexId(params.databaseName, params.collectionName, params.schema, asArray);
                            const indexSQLParts = asArray.map(indexKey => getJsonExtract(primaryPath, indexKey));
                            const query = 'CREATE INDEX IF NOT EXISTS "' + indexId + '" ON "' + tableName + '"(' + indexSQLParts.join(', ') + ');'

                            await sqliteBasics.run(
                                database,
                                {
                                    query,
                                    params: [],
                                    context: {
                                        method: 'createSQLiteStorageInstance create indexes table',
                                        data: params.databaseName
                                    }
                                }
                            );
                        })
                    );
                    return 'COMMIT';
                },
                {
                    indexCreation: true,
                    databaseName: params.databaseName,
                    collectionName: params.collectionName
                }
            );
            return database;
        });


    const instance = new RxStorageInstanceSQLite(
        storage,
        params.databaseName,
        params.collectionName,
        params.schema,
        internals as any,
        params.options,
        settings,
        tableName,
        params.devMode
    );

    await addRxStorageMultiInstanceSupport(
        RX_STORAGE_NAME_SQLITE,
        params,
        instance
    );

    return instance;
}
