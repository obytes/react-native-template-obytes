import { getRxStorageAbstractFilesystem } from '../storage-abstract-filesystem/index.js';
import {
    AbstractFileSystemDirectoryHandle,
    AbstractFileSystemFileHandle,
    AbstractFileSystemSyncAccessHandle,
    AbstractFilesystem,
    AbstractFilesystemCreateOptions
} from '../storage-abstract-filesystem/abstract-filesystem.js';
import { promises as fsPromises } from 'node:fs';
import * as fs from 'node:fs';
import { FileHandle } from 'node:fs/promises';
import * as path from 'node:path';
import * as webLocks from 'web-locks';
import { DEFAULT_DOC_JSON_POSITION_SIZE } from '../storage-abstract-filesystem/helpers.js';

export const RX_STORAGE_NAME_FILESYSTEM_NODE = 'filesystem-node';
export function getRxStorageFilesystemNode(args: {
    basePath: string,
    inWorker?: boolean
}) {
    const storage = getRxStorageAbstractFilesystem({
        name: RX_STORAGE_NAME_FILESYSTEM_NODE,
        abstractFilesystem: new NodeFilesystem(args.basePath),
        abstractLock: webLocks.locks,
        inWorker: false,
        jsonPositionSize: DEFAULT_DOC_JSON_POSITION_SIZE
    });
    return storage;
}


export class NodeFilesystem implements AbstractFilesystem {
    constructor(
        public readonly basePath: string
    ) { }
    async getDirectory() {
        return Promise.resolve(new NodeFilesystemDirectory(this.basePath));
    }
};

export class NodeFilesystemDirectory implements AbstractFileSystemDirectoryHandle {
    constructor(
        public readonly dirPath: string
    ) {

    }
    async getDirectoryHandle(
        name: string,
        options: { create: boolean; }
    ): Promise<AbstractFileSystemDirectoryHandle> {
        const newPath = path.join(this.dirPath, name);

        if (options.create) {
            await fsPromises.mkdir(newPath, { recursive: true });
        }
        return new NodeFilesystemDirectory(
            newPath
        );
    }
    async getFileHandle(filename: string, options: { create: boolean; }): Promise<AbstractFileSystemFileHandle> {
        const filePath = path.join(this.dirPath, filename);

        if (
            options.create &&
            !fs.existsSync(filePath)
        ) {
            await fs.promises.writeFile(filePath, '', 'utf-8');
        }

        return new NodeFilesystemFileHandle(
            filename,
            filePath,
            options
        );
    }
    removeEntry(filename: string): Promise<void> {
        return fsPromises.unlink(
            path.join(
                this.dirPath,
                filename
            )
        );
    }
}


export class NodeFilesystemFileHandle implements AbstractFileSystemFileHandle {
    constructor(
        public readonly name: string,
        public readonly filepath: string,
        public readonly options: AbstractFilesystemCreateOptions
    ) { }
    async createSyncAccessHandle(): Promise<AbstractFileSystemSyncAccessHandle> {

        if (
            !this.options.create &&
            !fs.existsSync(this.filepath)
        ) {
            throw new Error('File does not exist ' + this.filepath);
        }

        const flag = this.options.create ? 'r+' : 'r+';
        const nodeOpenHandle = await fsPromises.open(this.filepath, flag);
        return new NodeFilesystemFileSyncAccessHandle(
            this,
            nodeOpenHandle
        );
    }
}


export class NodeFilesystemFileSyncAccessHandle implements AbstractFileSystemSyncAccessHandle {
    constructor(
        public readonly fileHandle: NodeFilesystemFileHandle,
        public readonly nodeOpenHandle: FileHandle
    ) { }
    write(data: Uint8Array, options: { at: number; }) {
        return this.nodeOpenHandle.write(
            data as any,
            0,
            data.length,
            options.at
        ).then(() => {
            // TODO do we need this flush here?
            return this.flush();
        });
    }
    read(readBuffer: Uint8Array, options: { at: number; }) {
        return this.nodeOpenHandle.read({
            buffer: readBuffer,
            offset: 0,
            position: options.at
        }).then(() => { });
    }
    truncate(len: number) {
        return this.nodeOpenHandle.truncate(len);
    }
    async getSize() {
        const stat = await this.nodeOpenHandle.stat();
        return stat.size;
    }
    flush() {
        return this.nodeOpenHandle.sync();
    }
    close() {
        return this.nodeOpenHandle.close();
    }

}
