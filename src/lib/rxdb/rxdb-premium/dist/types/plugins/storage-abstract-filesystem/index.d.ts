/**
 * Relevant links for AbstractFilesystemApi performance:
 * @link https://nolanlawson.com/2021/08/22/speeding-up-AbstractFilesystemApi-reads-and-writes/
 * @link http://blog.nparashuram.com/2013/04/AbstractFilesystemApi-performance-comparisons-part-2.html
 */
import { RxStorage, RxStorageInstanceCreationParams } from 'rxdb/plugins/core';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { AbstractFilesystemInstanceCreationOptions, AbstractFilesystemStorageInternals } from './types.js';
import { AbstractFilesystem, AbstractLock } from './abstract-filesystem.js';
export declare class RxStorageAbstractFilesystem implements RxStorage<AbstractFilesystemStorageInternals, AbstractFilesystemInstanceCreationOptions> {
    name: string;
    abstractFilesystem: AbstractFilesystem;
    abstractLock: AbstractLock;
    inWorker: boolean;
    jsonPositionSize: number;
    readonly rxdbVersion = "15.8.1";
    constructor(name: string, abstractFilesystem: AbstractFilesystem, abstractLock: AbstractLock, inWorker: boolean, jsonPositionSize: number);
    createStorageInstance<RxDocType>(params: RxStorageInstanceCreationParams<RxDocType, AbstractFilesystemInstanceCreationOptions>): Promise<RxStorageInstanceAbstractFilesystem<RxDocType>>;
}
export declare function getRxStorageAbstractFilesystem(args: {
    name: string;
    abstractFilesystem: AbstractFilesystem;
    abstractLock: AbstractLock;
    inWorker?: boolean;
    jsonPositionSize: number;
}): RxStorageAbstractFilesystem;
