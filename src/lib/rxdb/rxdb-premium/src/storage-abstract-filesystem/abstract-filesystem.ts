import type { MaybePromise } from 'rxdb/plugins/core';

export type AbstractFilesystem = {
    getDirectory(): Promise<AbstractFileSystemDirectoryHandle>
};

export type AbstractFilesystemCreateOptions = {
    create: boolean;
};

export type AbstractFileSystemDirectoryHandle = {
    getDirectoryHandle(
        name: string,
        options: AbstractFilesystemCreateOptions
    ): Promise<AbstractFileSystemDirectoryHandle>;

    getFileHandle(
        filename: string,
        options: AbstractFilesystemCreateOptions
    ): Promise<AbstractFileSystemFileHandle>;

    removeEntry(filename: string): Promise<void>;
};

export type AbstractFileSystemFileHandle = {
    name: string;
    createSyncAccessHandle(): Promise<AbstractFileSystemSyncAccessHandle>

};

export type AbstractFileSystemSyncAccessHandle = {
    write(data: Uint8Array, options: { at: number; }): MaybePromise<void>;
    read(readBuffer: Uint8Array, options: { at: number; }): MaybePromise<void>;
    truncate(len: number): MaybePromise<void>;
    getSize(): MaybePromise<number>;
    flush(): MaybePromise<void>;
    close(): MaybePromise<void>;
};


export type AbstractLock = {
    request(
        lockId: string,
        fn: () => Promise<any>
    ): Promise<void>;
}
