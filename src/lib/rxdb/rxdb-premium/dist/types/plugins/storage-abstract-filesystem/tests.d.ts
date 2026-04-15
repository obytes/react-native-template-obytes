import { RxDocumentWriteData } from 'rxdb/plugins/core';
import { AbstractFilesystem, AbstractLock } from './abstract-filesystem.js';
export declare function runBasicsTests(abstractFilesystem: AbstractFilesystem, abstractLock: AbstractLock): Promise<void>;
export declare function getWriteData(ownParams?: Partial<RxDocumentWriteData<any>>): RxDocumentWriteData<any>;
