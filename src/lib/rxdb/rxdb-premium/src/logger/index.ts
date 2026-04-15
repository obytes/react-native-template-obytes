import {
    INTERNAL_STORE_SCHEMA_TITLE,
    META_INSTANCE_SCHEMA_TITLE,
    RxStorage,
    RxStorageInstance,
    RxStorageInstanceCreationParams,
    randomCouchString
} from 'rxdb/plugins/core';


/**
 * Here you can specific which operations to log.
 * By default, everything is true.
 */
export type LoggerRxStorageSettings = {
    prefix: string | undefined;

    /**
     * If set to true, it will log the
     * timings of operations with console.time() and console.timeEnd()
     */
    times: boolean;

    /**
     * Set this to false to not log operations
     * on meta instances like replication states
     * or database internals.
     */
    metaStorageInstances: boolean;

    // operations
    bulkWrite: boolean;
    findDocumentsById: boolean;
    query: boolean;
    count: boolean;
    info: boolean;
    getAttachmentData: boolean;
    getChangedDocumentsSince: boolean;
    cleanup: boolean;
    close: boolean;
    remove: boolean;
};

export const DEFAULT_LOGGER_SETTINGS: LoggerRxStorageSettings = {
    prefix: undefined,
    times: true,
    metaStorageInstances: true,

    // operations
    bulkWrite: true,
    findDocumentsById: true,
    query: true,
    count: true,
    info: true,
    getAttachmentData: true,
    getChangedDocumentsSince: true,
    cleanup: true,
    close: true,
    remove: true
};

export type OperationName = keyof RxStorageInstance<any, any, any, any>;

export type OnOperationStartFunction = (
    operationsName: OperationName,
    logId: string,
    args: any[]
) => void;
export type OnOperationErrorFunction = (
    operationsName: OperationName,
    logId: string,
    args: any[],
    error: any
) => void;

/**
 * Wraps the storage and simluates
 * delays. Mostly used in tests.
 */
export function wrappedLoggerStorage<Internals, InstanceCreationOptions>(
    args: {
        storage: RxStorage<Internals, InstanceCreationOptions>;
        settings?: LoggerRxStorageSettings;
        onOperationStart?: OnOperationStartFunction,
        onOperationEnd?: OnOperationStartFunction,
        onOperationError?: OnOperationErrorFunction
    }
): RxStorage<Internals, InstanceCreationOptions> {

    const settings = Object.assign(
        {},
        DEFAULT_LOGGER_SETTINGS,
        args.settings ? args.settings : {}
    );
    const prefix = [
        'RxDB',
        args.storage.name,
        settings.prefix
    ].filter(x => !!x).join('.');

    return Object.assign(
        {},
        args.storage,
        {
            async createStorageInstance<RxDocType>(
                params: RxStorageInstanceCreationParams<RxDocType, any>
            ) {
                const originalInstance = await args.storage.createStorageInstance(params);
                if (
                    !settings.metaStorageInstances &&
                    (
                        params.schema.title === INTERNAL_STORE_SCHEMA_TITLE ||
                        params.schema.title === META_INSTANCE_SCHEMA_TITLE
                    )
                ) {
                    return originalInstance;
                }

                async function wrapOperation(
                    operationName: OperationName,
                    operationArgs: any[],
                    hint: string
                ) {

                    if (!(settings as any)[operationName]) {
                        return await (originalInstance as any)[operationName](...operationArgs);
                    }

                    const operationId = 'instance:' + params.databaseInstanceToken + '_opId:' + randomCouchString(8);
                    const logId = [
                        prefix,
                        params.databaseName,
                        params.collectionName,
                    ].join('.') + '.' + operationName + '(' + hint + ') ' + operationId;
                    if (args.onOperationStart) {
                        args.onOperationStart(
                            operationName,
                            logId,
                            operationArgs
                        );
                    }
                    if (settings.times) {
                        console.time(logId);
                    }
                    try {
                        const result = await (originalInstance as any)[operationName](...operationArgs);
                        return result;
                    } catch (err: any) {
                        console.error(logId + ': ERROR: ' + err.name);
                        if (args.onOperationError) {
                            args.onOperationError(
                                operationName,
                                logId,
                                operationArgs,
                                err
                            );
                        }
                        throw err;
                    } finally {
                        if (settings.times) {
                            console.timeEnd(logId);
                        }
                        if (args.onOperationEnd) {
                            args.onOperationEnd(
                                operationName,
                                logId,
                                operationArgs
                            );
                        }
                    }
                }

                const instance: RxStorageInstance<RxDocType, Internals, InstanceCreationOptions, any> = {
                    databaseName: originalInstance.databaseName,
                    collectionName: originalInstance.collectionName,
                    internals: originalInstance.internals,
                    options: originalInstance.options,
                    schema: originalInstance.schema,
                    bulkWrite(a1, a2) {
                        return wrapOperation('bulkWrite', [a1, a2], a1.length.toString());
                    },
                    findDocumentsById(a1, a2) {
                        return wrapOperation('findDocumentsById', [a1, a2], a1.length.toString());
                    },
                    query(a1) {
                        return wrapOperation('query', [a1], '');
                    },
                    count(a1) {
                        return wrapOperation('count', [a1], '');
                    },
                    getAttachmentData(a1, a2, a3) {
                        return wrapOperation('getAttachmentData', [a1, a2, a3], '');
                    },
                    getChangedDocumentsSince: originalInstance.getChangedDocumentsSince ? (a1, a2) => {
                        return wrapOperation('getChangedDocumentsSince', [a1, a2], '');
                    } : undefined,
                    cleanup(a1) {
                        return wrapOperation('cleanup', [a1], '');
                    },
                    close() {
                        return wrapOperation('close', [], '');
                    },
                    remove() {
                        return wrapOperation('remove', [], '');
                    },
                    changeStream() {
                        return originalInstance.changeStream();
                    },
                    conflictResultionTasks() {
                        return originalInstance.conflictResultionTasks();
                    },
                    resolveConflictResultionTask(taskSolution) {
                        return originalInstance.resolveConflictResultionTask(taskSolution);
                    }
                };
                return instance;
            }
        }
    );
}
