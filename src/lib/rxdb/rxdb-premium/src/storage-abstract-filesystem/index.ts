/**
 * Relevant links for AbstractFilesystemApi performance:
 * @link https://nolanlawson.com/2021/08/22/speeding-up-AbstractFilesystemApi-reads-and-writes/
 * @link http://blog.nparashuram.com/2013/04/AbstractFilesystemApi-performance-comparisons-part-2.html
 */
import {
    ensureRxStorageInstanceParamsAreCorrect,
    RxStorage,
    RxStorageInstanceCreationParams
} from 'rxdb/plugins/core';
import { checkVersion } from '../../plugins/shared/version-check.js';
import {
    RxStorageInstanceAbstractFilesystem,
    createAbstractFilesystemStorageInstance
} from './storage-instance.js';
import {
    AbstractFilesystemInstanceCreationOptions,
    AbstractFilesystemStorageInternals
} from './types.js';
import { AbstractFilesystem, AbstractLock } from './abstract-filesystem.js';
import { map } from 'rxjs';
import { RXDB_PREMIUM_VERSION } from '../shared/rxdb-premium-version.js';
import { DEFAULT_DOC_JSON_POSITION_SIZE } from './helpers.js';


export class RxStorageAbstractFilesystem implements RxStorage<AbstractFilesystemStorageInternals, AbstractFilesystemInstanceCreationOptions> {
    readonly rxdbVersion = RXDB_PREMIUM_VERSION;
    constructor(
        public name: string,
        public abstractFilesystem: AbstractFilesystem,
        public abstractLock: AbstractLock,
        public inWorker: boolean,
        public jsonPositionSize: number
    ) { }

    public async createStorageInstance<RxDocType>(
        params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>
    ): Promise<RxStorageInstanceAbstractFilesystem<RxDocType>> {
        ensureRxStorageInstanceParamsAreCorrect(params);
        checkVersion();
        const instance = await createAbstractFilesystemStorageInstance(this, params, {});

        if (!this.inWorker) {
            const jsonStringFunctions = [
                'findDocumentsById',
                'query',
                'bulkWrite'
            ];
            jsonStringFunctions.forEach(fnName => {
                const fn = (instance as any)[fnName].bind(instance);
                (instance as any)[fnName] = async (a1: any, a2: any, a3: any, a4: any, a5: any) => {
                    let result = await fn(a1, a2, a3, a4, a5);
                    if (typeof result === 'string') {
                        result = JSON.parse(result);
                    }
                    return result;
                };
            });
            const changeStreamFn = instance.changeStream.bind(instance);
            instance.changeStream = () => {
                return changeStreamFn().pipe(
                    map(d => {
                        if (typeof d === 'string') {
                            d = JSON.parse(d);
                        }
                        return d;
                    })
                );
            }

        }

        return instance;
    }
}

export function getRxStorageAbstractFilesystem(args: {
    name: string,
    abstractFilesystem: AbstractFilesystem,
    abstractLock: AbstractLock,
    inWorker?: boolean,
    jsonPositionSize: number
}): RxStorageAbstractFilesystem {
    const storage = new RxStorageAbstractFilesystem(
        args.name,
        args.abstractFilesystem,
        args.abstractLock,
        args.inWorker ? args.inWorker : false,
        args.jsonPositionSize ? args.jsonPositionSize : DEFAULT_DOC_JSON_POSITION_SIZE
    );
    return storage;
}
