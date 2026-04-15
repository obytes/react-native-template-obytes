import {
    PROMISE_RESOLVE_VOID,
    RxStorageInstanceCreationParams
} from 'rxdb/plugins/core'
import {
    AbstractFilesystemInstanceCreationOptions
} from './types.js';
import { createSyncAccessHandleFromFileHandle } from './file-helpers.js';
import {
    AbstractFileSystemFileHandle,
    AbstractFileSystemSyncAccessHandle,
    AbstractLock
} from './abstract-filesystem.js';

export type TaskQueueRunState<RxDocType> = {
    type: 'READ' | 'WRITE' | 'INIT';
    /**
     * Amount of tasks that are proessed in this runState.
     */
    taskAmount: number;
    // used to cache file system access handlers and to ensure we properly close them all
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
export class TaskQueue<RxDocType> {
    queue: Promise<any> = PROMISE_RESOLVE_VOID;

    public readTasks: Task<RxDocType, any>[] = [];


    /**
     * Add stuff here that must run beafore each task queue read/write run.
     * Does not run on runInit()!
     */
    public beforeTaskReadOrWrite: ((runState: TaskQueueRunState<RxDocType>) => Promise<any>)[] = [];

    constructor(
        public lockId: string,
        public abstractLock: AbstractLock
    ) { }

    runRead<T>(task: Task<RxDocType, T>): Promise<T> {
        return new Promise((res, rej) => {
            this.readTasks.push((runState: TaskQueueRunState<RxDocType>) => {
                return task(runState)
                    .then(value => res(value))
                    .catch(err => rej(err));
            });
            this.triggerReadTasks();
        });
    }
    triggerReadTasks() {
        this.queue = this.queue.then(() => {
            if (this.readTasks.length === 0) {
                return;
            }
            return this.abstractLock.request(this.lockId, async () => {
                const tasks = this.readTasks;
                this.readTasks = [];
                const runState: TaskQueueRunState<RxDocType> = {
                    type: 'READ',
                    taskAmount: tasks.length,
                    accessHandlers: new Map(),
                    awaitBeforeFinish: []
                };
                await Promise.all(this.beforeTaskReadOrWrite.map(fn => fn(runState)));
                return Promise.all(
                    tasks.map(entry => entry(runState))
                ).then(() => this.cleanupAfterRun(runState));
            });
        });
    }

    runWrite<T>(task: Task<RxDocType, T>): Promise<T> {
        return new Promise((res, rej) => {
            this.queue = this.queue.then(() => {
                return this.abstractLock.request(this.lockId, async () => {
                    const runState: TaskQueueRunState<RxDocType> = {
                        type: 'WRITE',
                        taskAmount: 1,
                        accessHandlers: new Map(),
                        awaitBeforeFinish: []
                    };
                    await Promise.all(this.beforeTaskReadOrWrite.map(fn => fn(runState)));
                    return task(runState)
                        .then(value => {
                            res(value);
                        })
                        .catch(err => rej(err))
                        .then(() => this.cleanupAfterRun(runState));
                });
            });
        });
    }

    runInit<T>(task: Task<RxDocType, T>): Promise<T> {
        return new Promise((res, rej) => {
            this.queue = this.queue.then(() => {
                return this.abstractLock.request(this.lockId, async () => {
                    const runState: TaskQueueRunState<RxDocType> = {
                        type: 'INIT',
                        taskAmount: 1,
                        accessHandlers: new Map(),
                        awaitBeforeFinish: []
                    };
                    return task(runState)
                        .then(value => res(value))
                        .catch(err => rej(err))
                        .then(() => this.cleanupAfterRun(runState));
                });
            });
        });
    }

    async cleanupAfterRun(runState: TaskQueueRunState<RxDocType>): Promise<any> {
        await Promise.all(runState.awaitBeforeFinish.map(fn => fn()));
        await Promise.all(
            Array.from(runState.accessHandlers.values())
                .map(
                    accessHandlerPromise => accessHandlerPromise
                        .then(accessHandler => accessHandler.close())
                        .catch(err => { })
                )
        );
    }

    async awaitIdle() {
        while (true) {
            let queueObj = this.queue;
            await this.queue;
            if (this.queue === queueObj) {
                return;
            }
        }
    }
}




export function getAccessHandle(
    fileHandle: AbstractFileSystemFileHandle,
    runState: TaskQueueRunState<any>
): Promise<AbstractFileSystemSyncAccessHandle> {
    let accessHandlePromise = runState.accessHandlers.get(fileHandle);
    if (!accessHandlePromise) {
        accessHandlePromise = createSyncAccessHandleFromFileHandle(fileHandle);
        runState.accessHandlers.set(fileHandle, accessHandlePromise);
    }
    return accessHandlePromise;
}


export function getLockId(
    params: RxStorageInstanceCreationParams<any, AbstractFilesystemInstanceCreationOptions>
): string {
    const lockId = [
        'rxdb',
        'abstract-filesystem',
        'task-queue-lock',
        params.databaseName,
        params.collectionName,
        params.schema.version
    ].join('||');
    return lockId;
}
