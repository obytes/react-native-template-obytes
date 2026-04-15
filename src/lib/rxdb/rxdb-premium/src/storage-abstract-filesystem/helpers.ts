import {
    ensureNotFalsy,
    getPrimaryFieldOfPrimaryKey,
    RxStorageInstanceCreationParams,
    maxOfNumbers,
    EventBulk,
    RxStorageChangeEvent
} from 'rxdb/plugins/core';
import {
    BroadcastChannelMessage,
    ChangelogOperation,
    IndexRow,
    AbstractFilesystemInstanceCreationOptions,
    State
} from './types.js';
import {
    TaskQueue,
    getAccessHandle
} from './task-queue.js';
import {
    getChangelogFile,
    getChangelogOperations
} from './changelog.js';
import {
    IndexState,
    getIndexesFromSchema
} from './index-state.js';
import { Subject } from 'rxjs';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { AbstractFilesystem } from './abstract-filesystem.js';

/**
 * Notice that initial page load is very important for RxDB.
 * Therefore we do everything here lazy if possible
 * and we only return the promises.
 */
export async function getStorageInstanceInternalState<RxDocType>(
    abstractFilesystem: AbstractFilesystem,
    params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>,
    taskQueue: TaskQueue<RxDocType>,
    jsonPositionSize: number
) {
    // const rootPromise =  navigator.storage.getDirectory();
    const rootPromise = abstractFilesystem.getDirectory();
    const dirName = getDirectoryPath({
        databaseName: params.databaseName,
        collectionName: params.collectionName,
        schemaVersion: params.schema.version
    });
    const dirHandlePromise = rootPromise.then(root => root.getDirectoryHandle(dirName, { create: true }));
    const documentsFileHandlePromise = dirHandlePromise
        .then(dirHandle => dirHandle.getFileHandle('documents.json', { create: true }));
    return taskQueue.runInit(async (runState) => {
        const existedBeforeFileAccessHandlePromise = documentsFileHandlePromise
            .then(fileHandle => getAccessHandle(fileHandle, runState));
        const changesFileHandlePromise = dirHandlePromise
            .then(dirHandle => dirHandle.getFileHandle('changes.json', { create: true }));
        const primaryPath = getPrimaryFieldOfPrimaryKey(params.schema.primaryKey);
        const primaryKeyLength = ensureNotFalsy(params.schema.properties[primaryPath].maxLength);
        const indexes = getIndexesFromSchema(params.schema);

        const indexStates = indexes.map((index, indexId) => new IndexState<RxDocType>(
            indexId,
            index,
            dirHandlePromise,
            params.schema,
            jsonPositionSize
        ));

        let maxIndexableStringLength = maxOfNumbers(indexStates.map(i => i.indexableStringLength));
        const changelogFile = getChangelogFile(
            dirHandlePromise,
            maxIndexableStringLength,
            jsonPositionSize
        );

        /**
         * The initial page load is a very critical hot path.
         * Therefore we check if the documents file contains something
         * to know if the instance has existed before, and if NOT, we can skip
         * most of the initialization steps.
         */
        const existedBeforeFileAccessHandle = await existedBeforeFileAccessHandlePromise;
        const existedBeforeSize = await existedBeforeFileAccessHandle.getSize();
        if (existedBeforeSize > 0) {
            // storage constains something -> init indexes
            const [
                indexInit,
                changelogContent
            ] = await Promise.all([
                // read index files
                Promise.all(
                    indexStates.map(i => i.initRead(runState))
                ),
                getChangelogOperations(
                    runState,
                    changelogFile,
                    indexStates,
                    0
                )
            ]);
            // append changelog operations to index states
            Array
                .from(changelogContent.operationsByIndexId.entries())
                .map(([indexId, operations]) => {
                    const indexState = indexStates[indexId];
                    operations.forEach(op => indexState.runChangelogOperation(op));
                });
        }

        /**
         * Setup multi-instance handling.
         * This must be done as last step
         * to ensure no broadcast-channel message comes throught from
         * before which could mix up the memory state.
         */
        const broadcastChannel = params.multiInstance ? new BroadcastChannel(taskQueue.lockId) : undefined;

        // TODO check if this broadcast channel works in nodejs with multiple processes.
        if (broadcastChannel && (broadcastChannel as any).unref) {
            (broadcastChannel as any).unref();
        }
        const broadcastChannelMessages$ = new Subject<BroadcastChannelMessage<RxDocType>>();
        if (broadcastChannel) {
            broadcastChannel.onmessage = msg => {
                const data = msg.data;
                broadcastChannelMessages$.next(data);
            }
        }

        const state = {
            params,
            taskQueue,
            indexStates,
            primaryPath,
            primaryKeyLength,
            root: await rootPromise,
            dirHandle: await dirHandlePromise,
            changesFileHandle: await changesFileHandlePromise,
            documentFileHandle: await documentsFileHandlePromise,
            changelogFile,
            maxIndexableStringLength,
            broadcastChannel,
            broadcastChannelMessages$,
            /**
             * Flag here if there might be unprocessed changes at the change.json
             */
            mightHaveUnprocessedChanges: false
        };

        return state;
    });
}



export function toPaddedString(
    value: number | string,
    size: number
): string {
    const padChar = typeof value === 'number' ? '0' : ' ';
    const str = value + '';
    // if (str.length > size) {
    //     throw new Error(
    //         'toPaddedString(): input bigger then given size(' + size + ', is:' + str.length + '): "' + value + '"'
    //     );
    // }
    return str.padStart(size, padChar);
}


/**
 * Atm this value is set to 8 which means the limit
 * is 99999999 Bytes = 99.999999 MB which is way to low.
 * TODO in the next major release, we want to store up to gigabytes of data
 * so we set the value to 14 because 99999999999999 bytes is 99999 Gigabytes
 * which is 99 Terabytes.
 */
export const DEFAULT_DOC_JSON_POSITION_SIZE = 8;

// not all valid db names are valid file names
function ensureSaveName(str: string): string {
    return str.replace(/\//g, '__');
}


export function getDirectoryPath(args: {
    databaseName: string,
    collectionName: string,
    schemaVersion: number
}) {
    const parts = [
        'rxdb',
        ensureSaveName(args.databaseName),
        ensureSaveName(args.collectionName),
        args.schemaVersion
    ];
    return parts.join('-');
}

export function getTotalDocumentCount(
    state: State
): number {
    const indexState = ensureNotFalsy(state.indexStates[0]);
    return indexState.rows.length;
}



export function compareIndexRows(
    a: IndexRow,
    b: IndexRow
): 1 | 0 | -1 {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] === b[0]) {
        return 0;
    } else {
        return 1;
    }
}

/**
 * Notify the other instance about the required changelogOperations
 * that must run on the in-memory index-states.
 */
export function broadcastChangelogOperations<RxDocType>(
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    state: State,
    changelogOperations: ChangelogOperation[],
    eventBulk?: EventBulk<RxStorageChangeEvent<any>, any>
) {
    if (state.broadcastChannel) {
        const broadcastMessage: BroadcastChannelMessage<RxDocType> = {
            type: 'event',
            eventBulk,
            changelogOperations,
            info: {
                db: storageInstance.databaseName,
                col: storageInstance.collectionName
            }
        };
        state.broadcastChannel.postMessage(broadcastMessage);
    }
}
