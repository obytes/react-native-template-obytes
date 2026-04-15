import { RxDocumentData, RxStorageChangeEvent } from 'rxdb/plugins/core';
import { TaskQueueRunState } from './task-queue.js';
import { IndexRow, State } from './types.js';
import { AbstractFileSystemFileHandle, AbstractFileSystemSyncAccessHandle } from './abstract-filesystem.js';
export declare const DECODER: TextDecoder;
export declare const ENCODER: TextEncoder;
/**
 * Appends the documents json data
 * at the end of the documents file and
 * returns the starPos and endPos of each
 * json part.
 */
export declare function writeDocumentRows<RxDocType>(runState: TaskQueueRunState<RxDocType>, documentFileHandle: AbstractFileSystemFileHandle, events: RxStorageChangeEvent<RxDocumentData<RxDocType>>[]): Promise<[number, number][]>;
/**
 * MUST NOT be async!
 * @hotPath
 */
export declare function getDocumentsJson<RxDocType>(state: State, documentFileAccessHandle: AbstractFileSystemSyncAccessHandle, runState: TaskQueueRunState<RxDocType>,
  /**
   * The index rows of the documents to be found.
   */
  indexRows: IndexRow[]): Promise<RxDocumentData<RxDocType>[]>;
/**
 * Load a pre-build json string
 * which is faster to be send over postMessage() compared
 * to a complex object.
 * MUST NOT be async!
 * @hotPath
 */
export declare function getDocumentsJsonString<RxDocType>(state: State, documentFileAccessHandle: AbstractFileSystemSyncAccessHandle, runState: TaskQueueRunState<RxDocType>,
  /**
   * The index rows of the documents to be found.
   */
  indexRows: IndexRow[], returnType: 'ById' | 'Array'): Promise<string>;
