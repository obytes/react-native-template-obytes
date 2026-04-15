import {
    ensureNotFalsy,
    ensureRxStorageInstanceParamsAreCorrect,
    flatClone,
    RxStorage,
    RxStorageInstanceCreationParams
} from 'rxdb/plugins/core';
import { checkVersion } from '../../plugins/shared/version-check.js';
import { RX_STORAGE_NAME_SQLITE } from './sqlite-helpers.js';
import {
    createSQLiteStorageInstance,
    RxStorageInstanceSQLite
} from './sqlite-storage-instance.js';
import type {
    SQLiteInternals,
    SQLiteInstanceCreationOptions,
    SQLiteStorageSettings
} from './sqlite-types.js';
import { RXDB_PREMIUM_VERSION } from '../shared/rxdb-premium-version.js';


export * from './sqlite-helpers.js';
export * from './sqlite-types.js';
export * from './sqlite-storage-instance.js';
export * from './sqlite-basics-helpers.js';

/**
 * @link https://stackoverflow.com/a/38877890/3443137
 */
declare const Buffer: any;

export class RxStorageSQLite implements RxStorage<SQLiteInternals, SQLiteInstanceCreationOptions> {
    public name = RX_STORAGE_NAME_SQLITE;
    readonly rxdbVersion = RXDB_PREMIUM_VERSION;
    constructor(
        public settings: SQLiteStorageSettings
    ) { }

    public createStorageInstance<RxDocType>(
        params: RxStorageInstanceCreationParams<RxDocType, SQLiteInstanceCreationOptions>
    ): Promise<RxStorageInstanceSQLite<RxDocType>> {
        ensureRxStorageInstanceParamsAreCorrect(params);
        checkVersion();
        return createSQLiteStorageInstance(this, params, this.settings);
    }

    /**
     * Helper functions for SQLite attachments.
     * We need that because some runtimes do not support
     * storing buffers, so we have to store a plain base64 string instead.
     */
    public base64AttachmentToStoredAttachmentsData(base64: string): any {
        if (this.settings.storeAttachmentsAsBase64String) {
            return base64;
        }
        return Buffer.from(base64, 'base64');
    }
    public storedAttachmentsDataToBase64(stored: any): string {
        if (this.settings.storeAttachmentsAsBase64String) {
            return stored;
        }
        return stored.toString('base64');
    }

}


export function getRxStorageSQLite(
    settings: SQLiteStorageSettings
): RxStorageSQLite {

    /**
     * Wrap the SQLiteBasics
     * if a logger exists.
     */
    if (settings.log) {
        let logCount = 0;
        const logFn = (msg: string) => ensureNotFalsy(settings.log)('## RxStorage SQLite log: ' + msg);
        settings = flatClone(settings);
        const basics = flatClone(settings.sqliteBasics);

        // open()
        const openBefore = basics.open;
        basics.open = (name) => {
            const counter = logCount++;
            logFn('open(' + counter + ') ' + name);
            return openBefore(name).then(result => {
                logFn('open(' + counter + ') DONE ');
                return result;
            }).catch(err => {
                logFn('open(' + counter + ') ERROR ');
                throw err;
            });
        };

        // all()
        const allBefore = basics.all;
        basics.all = (db, queryWithParams) => {
            const counter = logCount++;
            logFn('all(' + counter + ') ' + JSON.stringify(queryWithParams));
            return allBefore(db, queryWithParams).then(result => {
                logFn('all(' + counter + ') DONE ');
                return result;
            }).catch(err => {
                logFn('all(' + counter + ') ERROR ');
                throw err;
            });
        };

        // run()
        const runBefore = basics.run;
        basics.run = (db, queryWithParams) => {
            const counter = logCount++;
            logFn('run(' + counter + ') ' + JSON.stringify(queryWithParams));
            return runBefore(db, queryWithParams).then(result => {
                logFn('run(' + counter + ') DONE ');
                return result;
            }).catch(err => {
                logFn('run(' + counter + ') ERROR ');
                throw err;
            });
        };

        // setPragma()
        const setPragmaBefore = basics.setPragma;
        basics.setPragma = (db, key, value) => {
            const counter = logCount++;
            logFn('setPragma(' + counter + ') ' + JSON.stringify({ key, value }));
            return setPragmaBefore(db, key, value).then(result => {
                logFn('setPragma(' + counter + ') DONE ');
                return result;
            }).catch(err => {
                logFn('setPragma(' + counter + ') ERROR ');
                throw err;
            });
        };


        settings.sqliteBasics = basics;
    }

    const storage = new RxStorageSQLite(settings);
    return storage;
}
