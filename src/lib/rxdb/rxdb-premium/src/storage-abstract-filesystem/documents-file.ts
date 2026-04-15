import {
    RxDocumentData,
    RxStorageChangeEvent,
    appendToArray,
    batchArray
} from 'rxdb/plugins/core';
import {
    TaskQueueRunState,
    getAccessHandle
} from './task-queue.js';
import { readTextByPosition } from './file-helpers.js';
import {
    IndexRow,
    State
} from './types.js';
import {
    getTotalDocumentCount
} from './helpers.js';
import {
    AbstractFileSystemFileHandle,
    AbstractFileSystemSyncAccessHandle
} from './abstract-filesystem.js';
export const DECODER = new TextDecoder();
export const ENCODER = new TextEncoder();

/**
 * Appends the documents json data
 * at the end of the documents file and
 * returns the starPos and endPos of each
 * json part.
 */
export async function writeDocumentRows<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    documentFileHandle: AbstractFileSystemFileHandle,
    events: RxStorageChangeEvent<RxDocumentData<RxDocType>>[]
): Promise<[number, number][]> {
    const ret: [number, number][] = [];
    const documentAccessHandle = await getAccessHandle(documentFileHandle, runState);
    let initialStartPos = await documentAccessHandle.getSize();


    const writeBuffers: Uint8Array[] = [];
    let totalWriteSize = 0;

    let position = initialStartPos;
    const rowsAmount = events.length;
    for (let x = 0; x < rowsAmount; x++) {
        const event = events[x];
        const docData = event.documentData;
        const writeString = JSON.stringify(docData);
        const startPos = position;

        /**
         * IMPORTANT: Here we have to run .encode()
         * once per document row so that we get the corrent byteLenght.
         * Otherwise using writeString.lenght on non utf-8 chars like umlauts would
         * cause a wrong pointer because they are stored in more then one byte.
         */
        const singleWriteData = ENCODER.encode(writeString);
        writeBuffers.push(singleWriteData);

        const writeSize = singleWriteData.byteLength;
        totalWriteSize += writeSize;
        position = position + writeSize;
        const endPos = position;
        ret.push([
            startPos,
            endPos
        ]);
    }


    // merge the write buffers so that we can do a singe file write operation
    const writeBuffer = new Uint8Array(totalWriteSize);
    let currentBufferIndex = 0;
    for (let x = 0; x < writeBuffers.length; x++) {
        const buffer = writeBuffers[x];
        writeBuffer.set(buffer, currentBufferIndex);
        currentBufferIndex += buffer.byteLength;
    }

    await documentAccessHandle.write(writeBuffer, { at: initialStartPos });
    return ret;
}


/**
 * MUST NOT be async!
 * @hotPath
 */
export async function getDocumentsJson<RxDocType>(
    state: State,
    documentFileAccessHandle: AbstractFileSystemSyncAccessHandle,
    runState: TaskQueueRunState<RxDocType>,
    /**
     * The index rows of the documents to be found.
     */
    indexRows: IndexRow[],
): Promise<RxDocumentData<RxDocType>[]> {
    let foundDocs: RxDocumentData<RxDocType>[] = [];

    /**
     * There is a maximum string length in all javascript engines.
     * So we have to split the fetching of json strings
     * to ensure we do not reach that limit.
     */
    const batches = batchArray(indexRows, 1000);
    await Promise.all(
        batches.map(async (batch) => {
            const fullJsonString = await getDocumentsJsonString(
                state,
                documentFileAccessHandle,
                runState,
                batch,
                'Array'
            );
            /**
             * Here we parse the json of all documents
             * in a single JSON.parse()
             * This has shown to be faster compared
             * to calling JSON.parse() once for each document.
             */
            const parsed: RxDocumentData<RxDocType>[] = JSON.parse(fullJsonString);
            if (foundDocs.length === 0) {
                foundDocs = parsed;
            } else {
                appendToArray(foundDocs, parsed);
            }
        })
    );
    return foundDocs;
}



/**
 * If we would fetch more then x% of the documents,
 * we just get the whole file for better performance.
 * Notice that if you change X, you have to do a lot
 * of testing to ensure it becomes faster, not slower.
 */
async function tryLoadWholeDocumentsFileContent<RxDocType>(
    state: State,
    runState: TaskQueueRunState<RxDocType>,
    documentFileAccessHandle: AbstractFileSystemSyncAccessHandle,
    docsAmount: number
) {
    if (runState.wholeDocumentsFileContent) {
        return;
    }
    const x = 0.15;
    if (
        getTotalDocumentCount(state) * x < docsAmount &&
        getTotalDocumentCount(state) > 1
    ) {
        const fileSize = await documentFileAccessHandle.getSize();
        const readBuffer = new Uint8Array(fileSize);
        await documentFileAccessHandle.read(readBuffer, { at: 0 });
        runState.wholeDocumentsFileContent = readBuffer;
    }
}


/**
 * Load a pre-build json string
 * which is faster to be send over postMessage() compared
 * to a complex object.
 * MUST NOT be async!
 * @hotPath
 */
export async function getDocumentsJsonString<RxDocType>(
    state: State,
    documentFileAccessHandle: AbstractFileSystemSyncAccessHandle,
    runState: TaskQueueRunState<RxDocType>,
    /**
     * The index rows of the documents to be found.
     */
    indexRows: IndexRow[],
    returnType: 'ById' | 'Array'
): Promise<string> {
    await tryLoadWholeDocumentsFileContent(
        state,
        runState,
        documentFileAccessHandle,
        indexRows.length
    );
    const docsAmount = indexRows.length;
    const wholeDocumentsFileContent = runState.wholeDocumentsFileContent;
    let docsJsonString = '';
    for (let i = 0; i < docsAmount; i++) {
        const indexRow = indexRows[i];
        /**
         * TODO 
         * if(!runState.wholeDocumentsFileContent) it might be faster to fetch a
         * range with multiple documents so that we have to
         * call readTextByPosition() less times.
        */
        const singleDocJsonString = wholeDocumentsFileContent ?
            DECODER.decode(wholeDocumentsFileContent.slice(indexRow[2], indexRow[3])) :
            await readTextByPosition(
                documentFileAccessHandle,
                indexRow[2],
                indexRow[3]
            );
        if (returnType === 'ById') {
            const docId = indexRow[1];
            docsJsonString += '"' + docId + '": ' + singleDocJsonString + ',';
        } else {
            docsJsonString += singleDocJsonString + ',';
        }
    }

    if (docsJsonString.length > 1) {
        docsJsonString = docsJsonString.slice(0, -1)
    }

    if (returnType === 'ById') {
        return '{' + docsJsonString + '}';
    } else {
        return '[' + docsJsonString + ']';
    }
}

