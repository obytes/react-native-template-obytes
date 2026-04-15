import {
    RxStorageInstanceCreationParams,
    EventBulk,
    getPrimaryFieldOfPrimaryKey,
    RxDocumentData,
    RxJsonSchema,
    RxStorageChangeEvent,
    RxStorageDefaultCheckpoint,
    RxStorageInstance,
    StringKeys,
    now,
    BulkWriteRow,
    RxConflictResultionTask,
    RxConflictResultionTaskSolution,
    RxStorageBulkWriteResponse,
    RxStorageCountResult,
    RxStorageQueryResult,
    PROMISE_RESOLVE_VOID,
    RXJS_SHARE_REPLAY_DEFAULTS,
    PreparedQuery,
} from 'rxdb/plugins/core';
import {
    Observable,
    Subject,
    shareReplay
} from 'rxjs';
import {
    getStorageInstanceInternalState
} from './helpers.js';
import {
    bulkWrite, processChangesFileIfRequired
} from './bulk-write.js';
import {
    BroadcastChannelMessage,
    AbstractFilesystemInstanceCreationOptions,
    AbstractFilesystemStorageInternals
} from './types.js';
import { findDocumentsByIds } from './find-by-ids.js';
import {
    TaskQueue,
    TaskQueueRunState,
    getAccessHandle,
    getLockId
} from './task-queue.js';
import { abstractFilesystemQuery } from './query.js';
import { getChangedDocumentsSince } from './get-changed-documents-since.js';
import {
    cleanup
} from './cleanup.js';
import { runBasicsTests } from './tests.js';
import { RxStorageAbstractFilesystem } from './index.js';
import { abstractFilesystemCount } from './count.js';
import { getAttachmentData } from './attachments.js';
import { AbstractFileSystemFileHandle } from './abstract-filesystem.js';

let instanceId = now();
export class RxStorageInstanceAbstractFilesystem<RxDocType> implements RxStorageInstance<
    RxDocType,
    AbstractFilesystemStorageInternals,
    AbstractFilesystemInstanceCreationOptions,
    RxStorageDefaultCheckpoint
> {
    public readonly primaryPath: StringKeys<RxDocType>;
    public readonly changes$: Subject<
        EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>
    > = new Subject();
    public readonly instanceId = instanceId++;
    public closed?: Promise<void>;

    public taskQueue: TaskQueue<RxDocType>;
    public readQueueEntries: any[] = [];

    constructor(
        public readonly storage: RxStorageAbstractFilesystem,
        public readonly databaseName: string,
        public readonly collectionName: string,
        public readonly schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>,
        public readonly internals: AbstractFilesystemStorageInternals,
        public readonly options: Readonly<AbstractFilesystemInstanceCreationOptions>,
        public readonly settings: {},
        public readonly databaseInstanceToken: string,
        public readonly jsonPositionSize: number
    ) {
        this.primaryPath = getPrimaryFieldOfPrimaryKey(this.schema.primaryKey) as any;
        this.taskQueue = internals.taskQueue;
    }

    bulkWrite(documentWrites: BulkWriteRow<RxDocType>[], context: string): Promise<RxStorageBulkWriteResponse<RxDocType>> {
        return this.taskQueue.runWrite(async (runState: TaskQueueRunState<RxDocType>) => {
            return bulkWrite(
                runState,
                this,
                documentWrites,
                context
            );
        });
    }
    async findDocumentsById(
        ids: string[],
        withDeleted: boolean
    ): Promise<RxDocumentData<RxDocType>[]> {
        return this.taskQueue.runRead((runState) => findDocumentsByIds(
            this,
            ids,
            withDeleted,
            runState
        )) as any;
    }
    query(preparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageQueryResult<RxDocType>> {
        return this.taskQueue.runRead(async (runState) => {
            return abstractFilesystemQuery(this, preparedQuery, runState);
        }) as any;
    }
    async count(preparedQuery: PreparedQuery<RxDocType>): Promise<RxStorageCountResult> {
        if (preparedQuery.queryPlan.selectorSatisfiedByIndex) {
            return this.taskQueue.runRead(async (runState) => {
                const ret = await abstractFilesystemCount(this, preparedQuery, runState);
                return ret;
            });
        } else {
            const queryResult = await this.query(preparedQuery);
            return {
                count: queryResult.documents.length,
                mode: 'slow'
            };
        }
    }
    getAttachmentData(
        documentId: string,
        attachmentId: string,
        digest: string
    ): Promise<string> {
        return this.taskQueue.runRead(async (runState) => {
            return getAttachmentData(
                runState,
                this,
                documentId,
                attachmentId,
                digest
            );
        });
    }
    getChangedDocumentsSince(limit: number, checkpoint?: RxStorageDefaultCheckpoint | undefined): Promise<{ documents: RxDocumentData<RxDocType>[]; checkpoint: RxStorageDefaultCheckpoint; }> {
        return this.taskQueue.runRead(async (runState) => {
            return getChangedDocumentsSince(
                this,
                runState,
                limit,
                checkpoint
            );
        });
    }
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocType>, RxStorageDefaultCheckpoint>> {
        return this.changes$.pipe(
            /**
             * Sometimes it can happen that a process is killed during a write
             * operation and another instance has to finish the processing of the write.
             * In these rare cases a RxChangeEvent could be send twice
             * so we have to filter it out here.
             * Notice that we only have to compare with the last previous event
             * because the order of the events is guaranteed in all cases.
             *
             * TODO uncomment this and ensure it even works if the EventBulk is
             * sending as string
             */
            // distinctUntilChanged((a, b) => a.id === b.id),
            shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
        );
    }
    cleanup(minimumDeletedTime: number): Promise<boolean> {
        return this.taskQueue.runWrite(async (runState) => {
            const ret = await cleanup(
                this,
                runState,
                minimumDeletedTime
            );
            return ret;
        });
    }
    async close(): Promise<void> {
        if (this.closed) {
            return this.closed;
        }
        this.closed = (async () => {
            const state = await this.internals.statePromise;
            await this.taskQueue.awaitIdle();
            state.broadcastChannelMessages$.complete();
            this.changes$.complete();
        })();
        return this.closed;
    }
    async remove(): Promise<void> {
        if (this.closed) {
            throw new Error('instance is closed ' + this.databaseName + '-' + this.collectionName);
        }

        await this.taskQueue.awaitIdle();
        await this.close();
        await this.taskQueue.runWrite(async (runState) => {
            const state = await this.internals.statePromise;
            const fileHandles: (Promise<AbstractFileSystemFileHandle> | AbstractFileSystemFileHandle)[] = [
                state.documentFileHandle,
                state.changelogFile.fileHandle
            ];
            for (const indexState of state.indexStates) {
                fileHandles.push(indexState.fileHandle);
            }
            await Promise.all(
                fileHandles
                    .map(async (fileHandleMaybePromise) => {
                        const fileHandle = await fileHandleMaybePromise;
                        const accessHandle = await getAccessHandle(fileHandle, runState);
                        await accessHandle.truncate(0);
                    })
            );
        });
    }
    conflictResultionTasks(): Observable<RxConflictResultionTask<RxDocType>> {
        return new Subject<any>().asObservable();
    }
    resolveConflictResultionTask(_taskSolution: RxConflictResultionTaskSolution<RxDocType>): Promise<void> {
        return PROMISE_RESOLVE_VOID;
    }
}

let basicsTestDone = false;
export async function createAbstractFilesystemStorageInstance<RxDocType>(
    storage: RxStorageAbstractFilesystem,
    params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>,
    settings: {}
): Promise<RxStorageInstanceAbstractFilesystem<RxDocType>> {
    if (!basicsTestDone && params.devMode) {
        basicsTestDone = true;
        await runBasicsTests(
            storage.abstractFilesystem,
            storage.abstractLock
        );
    }

    const lockId = getLockId(params);
    const taskQueue = new TaskQueue<RxDocType>(lockId, storage.abstractLock);
    const internals: AbstractFilesystemStorageInternals = {
        taskQueue,
        statePromise: getStorageInstanceInternalState<RxDocType>(
            storage.abstractFilesystem,
            params,
            taskQueue,
            storage.jsonPositionSize
        ) as any
    };

    const storageInstance = new RxStorageInstanceAbstractFilesystem(
        storage,
        params.databaseName,
        params.collectionName,
        params.schema,
        internals,
        params.options,
        settings,
        params.databaseInstanceToken,
        storage.jsonPositionSize
    );

    internals.statePromise.then(state => {
        taskQueue.beforeTaskReadOrWrite.push(
            (runState) => processChangesFileIfRequired(
                runState,
                state,
                storageInstance,
                false
            )
        )
    });

    internals.statePromise.then(state => {
        state.broadcastChannelMessages$.subscribe(async (msg: BroadcastChannelMessage<any>) => {
            if (msg.type === 'event') {
                msg.changelogOperations.forEach(changelogOperation => {
                    const indexId = changelogOperation[0];
                    state.indexStates[indexId].runChangelogOperation(changelogOperation);
                });
                if (msg.eventBulk) {
                    storageInstance.changes$.next(msg.eventBulk);
                }
            } else if (msg.type === 'pre-write') {
                state.mightHaveUnprocessedChanges = msg.mightHaveUnprocessedChanges;
            } else {
                throw new Error('BroadcastChannelMessageChanges$: unknown type ' + msg);
            }
        });
    });

    return storageInstance;
}
