import {
    sumNumberArray
} from 'rxdb/plugins/core';
import {
    TaskQueueRunState,
    getAccessHandle
} from './task-queue.js';
import {
    iterateStringCells,
    readFileContent
} from './file-helpers.js';
import { toPaddedString } from './helpers.js';
import { AbstractFileSystemFileHandle } from './abstract-filesystem.js';


const DECODER = new TextDecoder();
const ENCODER = new TextEncoder();

/**
 * Used to unify file handling.
 * Each file contains a header and rows
 * and can be queried by them.
 */
export class AbstractFile<
    HeaderType extends object,
    RowType extends Array<number | string>
> {
    public rowLength: number;
    public cellSizes: number[];
    constructor(
        public readonly fileHandle: Promise<AbstractFileSystemFileHandle>,
        public readonly headerSize: number,
        public readonly cells: {
            type: 'string' | 'number',
            length: number;
        }[]
    ) {
        this.cellSizes = cells.map(r => r.length);
        this.rowLength = sumNumberArray(this.cellSizes);
    }

    getAccessHandle(runState: TaskQueueRunState<any>) {
        return this.fileHandle.then(fileHandle => getAccessHandle(fileHandle, runState));
    }

    async readHeader(
        runState: TaskQueueRunState<any>
    ): Promise<HeaderType | undefined> {
        const accessHandle = await this.getAccessHandle(runState);
        const readBuffer = new Uint8Array(this.headerSize);
        await accessHandle.read(readBuffer, { at: 0 });
        const hasContent = readBuffer.find(r => r !== 0);
        if (!hasContent) {
            return undefined;
        }
        const headerString = DECODER.decode(readBuffer).trim();
        return JSON.parse(headerString);
    }

    async writeHeader(
        runState: TaskQueueRunState<any>,
        header: HeaderType
    ) {
        const writeBuffer = ENCODER.encode(JSON.stringify(header).padStart(this.headerSize, ' '));
        const accessHandle = await this.getAccessHandle(runState);
        const writeSize = await accessHandle.write(writeBuffer, { at: 0 });
    }

    async readRows(
        runState: TaskQueueRunState<any>,
        startRow: number,
        onRow: (cellValues: RowType) => void
    ) {
        const accessHandle = await this.getAccessHandle(runState);
        const startPointer = (this.headerSize) + (startRow * this.rowLength);
        const content = await readFileContent(accessHandle, startPointer);
        iterateStringCells(
            content,
            this.cellSizes,
            (chunk) => {
                const cellValues = this.cells.map((cell, idx) => {
                    const stringValue = chunk[idx];
                    if (cell.type === 'number') {
                        return parseInt(stringValue, 10);
                    } else if (cell.type === 'string') {
                        return stringValue;
                    } else {
                        throw new Error('unknown type ' + cell.type);
                    }
                }) as RowType;

                onRow(cellValues);
            }
        );
    }

    getRowString(
        row: RowType
    ) {
        let rowString: string = '';
        const cells = this.cells;
        const cellsAmount = cells.length;
        for (let x = 0; x < cellsAmount; x++) {
            const cellInfo = cells[x];
            const cell = row[x];
            if (cellInfo.type === 'number') {
                rowString += toPaddedString(cell, cells[x].length);
            } else {
                rowString += cell;
            }
        }
        return rowString;
    }

    /**
     * Write rows to the end of the file
     */
    async appendRows(
        runState: TaskQueueRunState<any>,
        rows: RowType[]
    ): Promise<{ startPosition: number }> {
        const accessHandle = await this.getAccessHandle(runState);
        let startPosition = await accessHandle.getSize();
        if (startPosition < (this.headerSize)) {
            startPosition = this.headerSize;
        }
        let writeContent: string = '';
        const mustHaveRowLength = this.rowLength;
        const rowsAmount = rows.length;
        for (let x = 0; x < rowsAmount; x++) {
            const row = rows[x];
            const rowString = this.getRowString(row);
            /**
             * We need this check to ensure we never store data
             * that might break the whole database state.
             * TODO remove this in the future when the storage is more stable.
             */
            if (rowString.length !== mustHaveRowLength) {
                throw new Error('rowString has wrong length (' + rowString.length + ')');
            }
            writeContent += rowString;
        }
        const writeBuffer = ENCODER.encode(writeContent);
        await accessHandle.write(writeBuffer, { at: startPosition });
        return {
            startPosition
        };
    }

    async replaceContent(
        runState: TaskQueueRunState<any>,
        rows: RowType[]
    ) {
        const accessHandle = await this.getAccessHandle(runState);
        const content = rows.map(row => this.getRowString(row)).join('');
        const writeBuffer = ENCODER.encode(content);
        await accessHandle.write(writeBuffer, { at: this.headerSize });
        const endOfFile = this.headerSize + content.length;

        // strip other data that might have been after the new ending
        await accessHandle.truncate(endOfFile);
    }


    async empty(
        runState: TaskQueueRunState<any>
    ) {
        const accessHandle = await this.getAccessHandle(runState);
        await accessHandle.truncate(this.headerSize);
    }
}
