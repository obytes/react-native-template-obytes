import { RxStorageInstanceCreationParams } from 'rxdb/plugins/core';
import { AbstractFilesystemInstanceCreationOptions } from './types.js';
import { AbstractFileSystemFileHandle, AbstractFileSystemSyncAccessHandle, AbstractLock } from './abstract-filesystem.js';
export type TaskQueueRunState<RxDocType> = {
    type: 'READ' | 'WRITE' | 'INIT';
    /**
     * Amount of tasks that are proessed in this runState.
     */
    taskAmount: number;
    accessHandlers: Map<AbstractFileSystemFileHandle, Promise<AbstractFileSystemSyncAccessHandle>>;
    /**
     * If the storage decides that it is worth it to read
     * and parse the full document file at this queue-run,
     * we can reuse the content in the current queue-run.
     */
    wholeDocumentsFileContent?: Uint8Array;
    /**
     * You can put any function here for cleanups etc.
     * These functions will be called and awaited before the Task is finished.
     * Mostly used so that the storage can already returns results to RxDB
     * while there is still some processing to do in the background.
     */
    awaitBeforeFinish: (() => Promise<any>)[];
};
export type Task<RxDocType, ReturnValue> = (runState: TaskQueueRunState<RxDocType>) => Promise<ReturnValue>;
/**
 * Used to ensure theres is always either a read or a write ongoing.
 * Reads can run in parallel. Writes can NOT run in parallel.
 *
 * @link https://sqlite.org/forum/info/58a377083cd24a
 *
 * For the case where multiple browser tabs are opened,
 * we use the WebLock API to ensure that only one task run
 * is happening at once.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
 *
 */
export declare class TaskQueue<RxDocType> {
    lockId: string;
    abstractLock: AbstractLock;
    queue: Promise<any>;
    readTasks: Task<RxDocType, any>[];
    /**
     * Add stuff here that must run beafore each task queue read/write run.
     * Does not run on runInit()!
     */
    beforeTaskReadOrWrite: ((runState: TaskQueueRunState<RxDocType>) => Promise<any>)[];
    constructor(lockId: string, abstractLock: AbstractLock);
    runRead<T>(task: Task<RxDocType, T>): Promise<T>;
    triggerReadTasks(): void;
    runWrite<T>(task: Task<RxDocType, T>): Promise<T>;
    runInit<T>(task: Task<RxDocType, T>): Promise<T>;
    cleanupAfterRun(runState: TaskQueueRunState<RxDocType>): Promise<any>;
    awaitIdle(): Promise<void>;
}
export declare function getAccessHandle(fileHandle: AbstractFileSystemFileHandle, runState: TaskQueueRunState<any>): Promise<AbstractFileSystemSyncAccessHandle>;
export declare function getLockId(params: RxStorageInstanceCreationParams<any, AbstractFilesystemInstanceCreationOptions>): string;
