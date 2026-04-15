/// <reference types="node" />
import { AbstractFileSystemDirectoryHandle, AbstractFileSystemFileHandle, AbstractFileSystemSyncAccessHandle, AbstractFilesystem, AbstractFilesystemCreateOptions } from '../storage-abstract-filesystem/abstract-filesystem.js';
import { FileHandle } from 'node:fs/promises';
export declare const RX_STORAGE_NAME_FILESYSTEM_NODE = "filesystem-node";
export declare function getRxStorageFilesystemNode(args: {
    basePath: string;
    inWorker?: boolean;
}): import("../storage-abstract-filesystem/index.js").RxStorageAbstractFilesystem;
export declare class NodeFilesystem implements AbstractFilesystem {
    readonly basePath: string;
    constructor(basePath: string);
    getDirectory(): Promise<NodeFilesystemDirectory>;
}
export declare class NodeFilesystemDirectory implements AbstractFileSystemDirectoryHandle {
    readonly dirPath: string;
    constructor(dirPath: string);
    getDirectoryHandle(name: string, options: {
        create: boolean;
    }): Promise<AbstractFileSystemDirectoryHandle>;
    getFileHandle(filename: string, options: {
        create: boolean;
    }): Promise<AbstractFileSystemFileHandle>;
    removeEntry(filename: string): Promise<void>;
}
export declare class NodeFilesystemFileHandle implements AbstractFileSystemFileHandle {
    readonly name: string;
    readonly filepath: string;
    readonly options: AbstractFilesystemCreateOptions;
    constructor(name: string, filepath: string, options: AbstractFilesystemCreateOptions);
    createSyncAccessHandle(): Promise<AbstractFileSystemSyncAccessHandle>;
}
export declare class NodeFilesystemFileSyncAccessHandle implements AbstractFileSystemSyncAccessHandle {
    readonly fileHandle: NodeFilesystemFileHandle;
    readonly nodeOpenHandle: FileHandle;
    constructor(fileHandle: NodeFilesystemFileHandle, nodeOpenHandle: FileHandle);
    write(data: Uint8Array, options: {
        at: number;
    }): Promise<void>;
    read(readBuffer: Uint8Array, options: {
        at: number;
    }): Promise<void>;
    truncate(len: number): Promise<void>;
    getSize(): Promise<number>;
    flush(): Promise<void>;
    close(): Promise<void>;
}
