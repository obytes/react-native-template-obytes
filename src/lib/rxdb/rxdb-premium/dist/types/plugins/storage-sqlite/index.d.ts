import { RxStorage, RxStorageInstanceCreationParams } from 'rxdb/plugins/core';
import { RxStorageInstanceSQLite } from './sqlite-storage-instance.js';
import type { SQLiteInternals, SQLiteInstanceCreationOptions, SQLiteStorageSettings } from './sqlite-types.js';
export * from './sqlite-helpers.js';
export * from './sqlite-types.js';
export * from './sqlite-storage-instance.js';
export * from './sqlite-basics-helpers.js';
export declare class RxStorageSQLite implements RxStorage<SQLiteInternals, SQLiteInstanceCreationOptions> {
    settings: SQLiteStorageSettings;
    name: string;
    readonly rxdbVersion = "15.8.1";
    constructor(settings: SQLiteStorageSettings);
    createStorageInstance<RxDocType>(params: RxStorageInstanceCreationParams<RxDocType, SQLiteInstanceCreationOptions>): Promise<RxStorageInstanceSQLite<RxDocType>>;
    /**
     * Helper functions for SQLite attachments.
     * We need that because some runtimes do not support
     * storing buffers, so we have to store a plain base64 string instead.
     */
    base64AttachmentToStoredAttachmentsData(base64: string): any;
    storedAttachmentsDataToBase64(stored: any): string;
}
export declare function getRxStorageSQLite(settings: SQLiteStorageSettings): RxStorageSQLite;
