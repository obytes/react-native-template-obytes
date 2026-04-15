import {
    sumNumberArray
} from 'rxdb/plugins/core';
import {
    AbstractFileSystemFileHandle,
    AbstractFileSystemSyncAccessHandle
} from './abstract-filesystem';

const DECODER = new TextDecoder();

/**
 * @link https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/
 */
export async function readFileContent(
    accessHandle: AbstractFileSystemSyncAccessHandle,
    // start pointer
    at = 0
): Promise<string> {
    /**
     * @link https://stackoverflow.com/a/47612303
     */
    const startPointerUnsigned = at >>> 0;


    const fileSize = await accessHandle.getSize();
    if (fileSize === 0) {
        return '';
    }
    const readBufferSize = fileSize - at;

    // Read file content to a buffer.
    const readBuffer = new Uint8Array(readBufferSize);
    await accessHandle.read(readBuffer, { at: startPointerUnsigned });
    const content = DECODER.decode(readBuffer);
    return content;
}


export function iterateStringChunks(
    content: string,
    chunkSize: number, // in chars
    onChunk: (chunk: string) => void
) {
    const fullLength = content.length;
    let position = 0;
    while (position < fullLength) {
        const chunk = content.slice(position, position + chunkSize);
        position = position + chunkSize;
        onChunk(chunk);
    }
}

export function getChunkCells(
    chunk: string,
    cellSizes: number[]
): string[] {
    const ret: string[] = [];
    let position = 0;
    for (const cellSize of cellSizes) {
        const value = chunk.slice(position, position + cellSize);
        position = position + cellSize;
        ret.push(value);
    }
    return ret;
}

export function iterateStringCells(
    content: string,
    cellSizes: number[],
    onChunk: (cell: string[]) => void
) {
    const chunkSize = sumNumberArray(cellSizes);
    iterateStringChunks(
        content,
        chunkSize,
        (chunk: string) => {
            const ar = getChunkCells(chunk, cellSizes);
            onChunk(ar);
        }
    )
}

export async function readTextByPosition(
    accessHandle: AbstractFileSystemSyncAccessHandle,
    startPos: number,
    endPos: number
): Promise<string> {
    const readSize = endPos - startPos;
    const readBuffer = new Uint8Array(readSize);
    await accessHandle.read(readBuffer, { at: startPos });
    const contentString = DECODER.decode(readBuffer);
    return contentString;
}


export async function createSyncAccessHandleFromFileHandle(fileHandle: AbstractFileSystemFileHandle): Promise<AbstractFileSystemSyncAccessHandle> {
    if (typeof (fileHandle as any).createSyncAccessHandle !== 'function') {
        throw new Error('Could not access fileHandle.createSyncAccessHandle(). Likely this is because this storage only works "inside dedicated Web Workers"');
    }
    try {
        const val = await (fileHandle as any).createSyncAccessHandle();
        return val;
    } catch (err) {
        throw err;
        throw new Error(JSON.stringify({
            fn: 'createSyncAccessHandleFromFileHandle',
            fileHandle: fileHandle.name,
            err
        }));
    }
}
