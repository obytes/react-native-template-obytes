import { TaskQueueRunState } from './task-queue.js';
import { AbstractFileSystemFileHandle } from './abstract-filesystem.js';
/**
 * Used to unify file handling.
 * Each file contains a header and rows
 * and can be queried by them.
 */
export declare class AbstractFile<HeaderType extends object, RowType extends Array<number | string>> {
    readonly fileHandle: Promise<AbstractFileSystemFileHandle>;
    readonly headerSize: number;
    readonly cells: {
        type: 'string' | 'number';
        length: number;
    }[];
    rowLength: number;
    cellSizes: number[];
    constructor(fileHandle: Promise<AbstractFileSystemFileHandle>, headerSize: number, cells: {
        type: 'string' | 'number';
        length: number;
    }[]);
    getAccessHandle(runState: TaskQueueRunState<any>): Promise<import("./abstract-filesystem.js").AbstractFileSystemSyncAccessHandle>;
    readHeader(runState: TaskQueueRunState<any>): Promise<HeaderType | undefined>;
    writeHeader(runState: TaskQueueRunState<any>, header: HeaderType): Promise<void>;
    readRows(runState: TaskQueueRunState<any>, startRow: number, onRow: (cellValues: RowType) => void): Promise<void>;
    getRowString(row: RowType): string;
    /**
     * Write rows to the end of the file
     */
    appendRows(runState: TaskQueueRunState<any>, rows: RowType[]): Promise<{
        startPosition: number;
    }>;
    replaceContent(runState: TaskQueueRunState<any>, rows: RowType[]): Promise<void>;
    empty(runState: TaskQueueRunState<any>): Promise<void>;
}
