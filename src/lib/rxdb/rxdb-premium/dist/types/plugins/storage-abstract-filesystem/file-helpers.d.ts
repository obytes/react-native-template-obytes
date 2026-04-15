import { AbstractFileSystemFileHandle, AbstractFileSystemSyncAccessHandle } from './abstract-filesystem';
/**
 * @link https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/
 */
export declare function readFileContent(accessHandle: AbstractFileSystemSyncAccessHandle, at?: number): Promise<string>;
export declare function iterateStringChunks(content: string, chunkSize: number, // in chars
onChunk: (chunk: string) => void): void;
export declare function getChunkCells(chunk: string, cellSizes: number[]): string[];
export declare function iterateStringCells(content: string, cellSizes: number[], onChunk: (cell: string[]) => void): void;
export declare function readTextByPosition(accessHandle: AbstractFileSystemSyncAccessHandle, startPos: number, endPos: number): Promise<string>;
export declare function createSyncAccessHandleFromFileHandle(fileHandle: AbstractFileSystemFileHandle): Promise<AbstractFileSystemSyncAccessHandle>;
