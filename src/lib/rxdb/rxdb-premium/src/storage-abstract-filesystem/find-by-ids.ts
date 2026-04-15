import { RxDocumentData, ensureNotFalsy } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import {
    TaskQueueRunState,
    getAccessHandle
} from './task-queue.js';
import {
    getDocumentsJson,
    getDocumentsJsonString
} from './documents-file.js';
import { getTotalDocumentCount } from './helpers.js';
import { IndexRow } from './types.js';
export async function findDocumentsByIds<RxDocType>(
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    docIds: string[],
    withDeleted: boolean,
    runState: TaskQueueRunState<RxDocType>
): Promise<string> {
    const state = await storageInstance.internals.statePromise;
    // performance shortcut
    if (getTotalDocumentCount(state) === 0) {
        return '[]';
    }

    /**
     * Trigger here and await later
     * @performance
     */
    const documentFileAccessHandlePromise = getAccessHandle(state.documentFileHandle, runState);

    const metaIdMap = ensureNotFalsy(state.indexStates[0].metaIdMap);
    const foundDocsIndexRows: IndexRow[] = [];
    const docsAmount = docIds.length;
    for (let x = 0; x < docsAmount; x++) {
        const docId = docIds[x];
        const metaMapEntry = metaIdMap.get(docId);
        if (
            metaMapEntry &&
            (
                withDeleted ||
                metaMapEntry[0][0] === '0' // if first char is '1' the doc is _deleted=true
            )
        ) {
            foundDocsIndexRows.push(metaMapEntry);
        }
    }

    // performance shortcut
    if (foundDocsIndexRows.length === 0) {
        return '[]';
    }

    const documentFileAccessHandle = await documentFileAccessHandlePromise;
    const foundDocsJsonString = await getDocumentsJsonString(
        state,
        documentFileAccessHandle,
        runState,
        foundDocsIndexRows,
        'Array'
    );
    return foundDocsJsonString;
}


export async function findDocumentsByIdsInternal<RxDocType>(
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    docIds: string[],
    runState: TaskQueueRunState<RxDocType>
): Promise<Map<string, RxDocumentData<RxDocType>>> {
    const ret: Map<string, RxDocumentData<RxDocType>> = new Map();
    const state = await storageInstance.internals.statePromise;
    // performance shortcut
    if (getTotalDocumentCount(state) === 0) {
        return ret;
    }

    /**
     * Trigger here and await later
     * @performance
     */
    const documentFileAccessHandlePromise = getAccessHandle(state.documentFileHandle, runState);

    const metaIdMap = ensureNotFalsy(state.indexStates[0].metaIdMap);
    const foundDocsIndexRows: IndexRow[] = [];
    const docsAmount = docIds.length;
    for (let x = 0; x < docsAmount; x++) {
        const docId = docIds[x];
        const metaMapEntry = metaIdMap.get(docId);
        if (metaMapEntry) {
            foundDocsIndexRows.push(metaMapEntry);
        }
    }

    // performance shortcut
    if (foundDocsIndexRows.length === 0) {
        return ret;
    }

    const documentFileAccessHandle = await documentFileAccessHandlePromise;
    const foundDocs = await getDocumentsJson(
        state,
        documentFileAccessHandle,
        runState,
        foundDocsIndexRows
    );
    const foundDocsAmount = foundDocsIndexRows.length;
    for (let x = 0; x < foundDocsAmount; x++) {
        const docData = foundDocs[x];
        const docId: string = foundDocsIndexRows[x][1];
        ret.set(docId, docData);
    }
    return ret;
}
