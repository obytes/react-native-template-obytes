import {
    RxDocumentData,
    RxStorageDefaultCheckpoint,
    ensureNotFalsy,
    getStartIndexStringFromLowerBound,
    lastOfArray
} from 'rxdb/plugins/core';
import { getIndexName } from '../storage-indexeddb/index.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { IndexRow } from './types.js';
import {
    boundGT
} from 'rxdb/plugins/storage-memory';
import { TaskQueueRunState, getAccessHandle } from './task-queue.js';
import { getDocumentsJson } from './documents-file.js';
import { compareIndexRows } from './helpers.js';

export async function getChangedDocumentsSince<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    runState: TaskQueueRunState<RxDocType>,
    limit: number,
    checkpoint?: RxStorageDefaultCheckpoint
): Promise<{ documents: RxDocumentData<RxDocType>[]; checkpoint: RxStorageDefaultCheckpoint; }> {
    if (!checkpoint) {
        checkpoint = {
            id: '',
            lwt: 0
        };
    }
    const state = await instance.internals.statePromise;
    const index = [
        '_meta.lwt',
        instance.primaryPath
    ];
    const indexName = getIndexName(index);
    const indexState = ensureNotFalsy(state.indexStates.find(s => s.name === indexName));

    // performance shortcut
    if (indexState.rows.length === 0) {
        return {
            documents: [],
            checkpoint
        };
    }

    const lowerBound: any[] = [
        checkpoint.lwt,
        checkpoint.id
    ];
    const lowerBoundString = getStartIndexStringFromLowerBound(
        instance.schema,
        index,
        lowerBound
    );

    let indexOfLower = boundGT<IndexRow>(
        indexState.rows,
        [
            lowerBoundString
        ] as any,
        compareIndexRows
    );
    const documentFileAccessHandle = await getAccessHandle(state.documentFileHandle, runState);

    // [1, 2, 3, 4, 5, 6, 7, 8, 9].slice(3, 3 + 4) = [4, 5, 6, 7]
    const useRows = indexState.rows.slice(indexOfLower, indexOfLower + limit);
    const result: RxDocumentData<RxDocType>[] = [];
    for (const indexRow of useRows) {
        // TODO bulk fetch
        const docsData = await getDocumentsJson(
            state,
            documentFileAccessHandle,
            runState,
            [indexRow]
        );
        const docData = docsData[0];
        result.push(docData);
    }

    const lastDocument = lastOfArray(result);
    return {
        documents: result,
        checkpoint: lastDocument ? {
            id: lastDocument[instance.primaryPath] as any,
            lwt: lastDocument._meta.lwt
        } : checkpoint
    };

}
