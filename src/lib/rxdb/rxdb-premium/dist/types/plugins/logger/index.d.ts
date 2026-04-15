import { RxStorage, RxStorageInstance } from 'rxdb/plugins/core';
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
export declare const DEFAULT_LOGGER_SETTINGS: LoggerRxStorageSettings;
export type OperationName = keyof RxStorageInstance<any, any, any, any>;
export type OnOperationStartFunction = (operationsName: OperationName, logId: string, args: any[]) => void;
export type OnOperationErrorFunction = (operationsName: OperationName, logId: string, args: any[], error: any) => void;
/**
 * Wraps the storage and simluates
 * delays. Mostly used in tests.
 */
export declare function wrappedLoggerStorage<Internals, InstanceCreationOptions>(args: {
    storage: RxStorage<Internals, InstanceCreationOptions>;
    settings?: LoggerRxStorageSettings;
    onOperationStart?: OnOperationStartFunction;
    onOperationEnd?: OnOperationStartFunction;
    onOperationError?: OnOperationErrorFunction;
}): RxStorage<Internals, InstanceCreationOptions>;
