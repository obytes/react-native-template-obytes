import {
    CategorizeBulkWriteRowsOutput,
    EventBulk,
    RxDocumentData,
    RxStorageChangeEvent,
    attachmentWriteDataToNormalData,
    defaultHashSha256,
    ensureNotFalsy
} from 'rxdb/plugins/core';
import { State } from './types.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import {
    TaskQueueRunState,
    getAccessHandle
} from './task-queue.js';
import { DECODER, ENCODER } from './documents-file.js';

export async function appendAttachmentFiles<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    categorized: CategorizeBulkWriteRowsOutput<RxDocType>,
    state: State
) {
    if (!storageInstance.schema.attachments) {
        return;
    }

    const writeAttachmentsFiles = categorized.attachmentsAdd.concat(categorized.attachmentsUpdate);
    if (writeAttachmentsFiles.length === 0) {
        return;
    }

    await Promise.all(
        writeAttachmentsFiles.map(async (attachment) => {
            const fileName = await getAttachmentFilename(
                attachment.documentId,
                attachment.attachmentId,
                attachmentWriteDataToNormalData(attachment.attachmentData).digest
            );
            const fileHandle = await state.dirHandle.getFileHandle(
                fileName,
                { create: true }
            );
            const accessHandle = await getAccessHandle(
                fileHandle,
                runState
            );
            await accessHandle.truncate(0);

            const writeBuffer = ENCODER.encode(attachment.attachmentData.data);
            await accessHandle.write(writeBuffer, { at: 0 });
            await accessHandle.flush();
            await accessHandle.close();
        })
    );
}


export async function clearDeletedAttachments<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    state: State,
    eventBulk: EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, any>
) {
    if (!storageInstance.schema.attachments) {
        return;
    }
    const mustBeDeleted: {
        documentId: string;
        attachmentId: string;
        digest: string;
    }[] = [];
    eventBulk.events.forEach(event => {
        if (!event.previousDocumentData) {
            return;
        }
        Object.keys(event.previousDocumentData._attachments).forEach(attachmentId => {
            if (
                !event.documentData._attachments[attachmentId] ||
                event.documentData._deleted
            ) {
                mustBeDeleted.push({
                    documentId: event.documentId,
                    attachmentId: attachmentId,
                    digest: ensureNotFalsy(event.previousDocumentData)._attachments[attachmentId].digest
                });
            }
        });
    });

    if (mustBeDeleted.length === 0) {
        return;
    }
    await Promise.all(
        mustBeDeleted.map(async (attachment) => {
            const fileName = await getAttachmentFilename(
                attachment.documentId,
                attachment.attachmentId,
                attachment.digest
            );
            const fileHandle = await state.dirHandle.getFileHandle(
                fileName,
                { create: true }
            );
            await state.dirHandle.removeEntry(fileHandle.name);
        })
    );
}

export async function getAttachmentData<RxDocType>(
    runState: TaskQueueRunState<RxDocType>,
    storageInstance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    documentId: string,
    attachmentId: string,
    digest: string
): Promise<string> {
    const state = await storageInstance.internals.statePromise;
    const fileName = await getAttachmentFilename(
        documentId,
        attachmentId,
        digest
    );
    const fileHandle = await state.dirHandle.getFileHandle(
        fileName,
        { create: false }
    );
    const accessHandle = await getAccessHandle(
        fileHandle,
        runState
    );
    const fileSize = await accessHandle.getSize();
    const readBuffer = new Uint8Array(fileSize);
    const readSize = await accessHandle.read(readBuffer, { at: 0 });
    return DECODER.decode(readBuffer);
}


export async function getAttachmentFilename(
    documentId: string,
    attachmentId: string,
    digest: string
): Promise<string> {
    const filenameHash = await defaultHashSha256(
        documentId + '||' + attachmentId
    );
    const fileName =
        // ensure it is sorted last
        'z-attachment-' +
        // hash to ensure no character is an invalid filename
        filenameHash.slice(0, 20) +
        // add digest to ensure new versions of the attachment data do not overwrite each other
        '-' + digest.slice(0, 20) +
        '.txt';
    return fileName;
}
