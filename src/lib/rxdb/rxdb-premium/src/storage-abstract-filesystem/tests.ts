import { DEFAULT_DOC_JSON_POSITION_SIZE, toPaddedString } from './helpers.js';
import { AbstractFile } from './file-abstraction.js';
import { TaskQueue, getAccessHandle } from './task-queue.js';
import {
    RxDocumentWriteData,
    clone,
    fillWithDefaultSettings,
    now,
    promiseWait,
    randomCouchString
} from 'rxdb/plugins/core';
import { getRxStorageAbstractFilesystem } from './index.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { randomNumber, randomString } from 'async-test-util';
import { AbstractFilesystem, AbstractLock } from './abstract-filesystem.js';
import { DECODER, ENCODER } from './documents-file.js';

export async function runBasicsTests(
    abstractFilesystem: AbstractFilesystem,
    abstractLock: AbstractLock
) {
    try {
        const taskQueue = new TaskQueue('runBasicsTests', abstractLock);
        const root = await abstractFilesystem.getDirectory();
        const dirHandle = await root.getDirectoryHandle('basics-test', { create: true });


        // check if has run already
        const checkFile = new AbstractFile<{ done: boolean }, Row>(
            dirHandle.getFileHandle('check-file.txt', { create: true }),
            100,
            []
        );
        let runAlready = false;
        await taskQueue.runWrite(async (runState) => {
            const header = await checkFile.readHeader(runState);
            if (header && header.done) {
                runAlready = true;
            }
        });
        if (runAlready) {
            console.log('dev-mode: runBasicsTests() HAS RUN ALREADY');
            return;
        }
        console.log('dev-mode: runBasicsTests() START');



        // test file system basics
        const fileWriteTest = await dirHandle.getFileHandle('write-test.txt', { create: true });
        const fileWriteTestAccessHandle = await fileWriteTest.createSyncAccessHandle();
        await fileWriteTestAccessHandle.write(
            ENCODER.encode('1234567890'),
            {
                at: 0
            }
        );

        const readBufferA = new Uint8Array(8);
        await fileWriteTestAccessHandle.read(
            readBufferA,
            {
                at: 2
            }
        );
        if (DECODER.decode(readBufferA) !== '34567890') {
            throw new Error('wrong readBufferA');
        }

        await fileWriteTestAccessHandle.write(
            ENCODER.encode('FOOBAR'),
            {
                at: 4
            }
        );
        const readBuffer = new Uint8Array(10);
        await fileWriteTestAccessHandle.read(
            readBuffer,
            {
                at: 0
            }
        );
        if (DECODER.decode(readBuffer) !== '1234FOOBAR') {
            throw new Error('wrong readBuffer');
        }

        await fileWriteTestAccessHandle.close();




        type Row = [number, string, string];
        const file = new AbstractFile<{ header: boolean }, Row>(
            dirHandle.getFileHandle('one-file.txt', { create: true }),
            0,
            [
                {
                    type: 'number',
                    length: 5
                },
                {
                    type: 'string',
                    length: 1
                },
                {
                    type: 'string',
                    length: 20
                }
            ]
        );


        const writeRows: Row[] = [
            [
                1,
                'A',
                toPaddedString('foobar1', 20)
            ],
            [
                2,
                'B',
                toPaddedString('foobar2', 20)
            ],
            [
                3,
                'C',
                toPaddedString('foobar3', 20)
            ]
        ];
        await taskQueue.runWrite(async (runState) => {
            await file.appendRows(runState, writeRows);
        });


        await taskQueue.runRead(async (runState) => {
            const readRows: Row[] = [];
            await file.readRows(
                runState,
                0,
                row => readRows.push(row)
            );

            if (JSON.stringify(writeRows) !== JSON.stringify(readRows)) {
                console.dir({ writeRows, readRows });
                throw new Error('rows not equal!');
            }
        });

        await taskQueue.runWrite(async (runState) => {
            await checkFile.writeHeader(runState, { done: true });
        });





        const writeContext = 'runBasicsTests()';
        console.log('dev-mode: runBasicsTests() ENSURE CLEANUP WORKS');
        const storage = getRxStorageAbstractFilesystem({
            name: 'test',
            abstractFilesystem,
            abstractLock,
            jsonPositionSize: DEFAULT_DOC_JSON_POSITION_SIZE
        });
        const storageInstance = await storage.createStorageInstance({
            databaseInstanceToken: randomCouchString(10),
            databaseName: randomCouchString(10),
            collectionName: randomCouchString(10),
            schema: fillWithDefaultSettings({
                version: 0,
                type: 'object',
                primaryKey: 'key',
                properties: {
                    key: {
                        type: 'string',
                        maxLength: 50
                    },
                    stringValue: {
                        type: 'string',
                        maxLength: 50
                    },
                    numberValue: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1000,
                        multipleOf: 1
                    },
                    nes: {
                        type: 'object',
                        properties: {
                            ted: {
                                type: 'string',
                                maxLength: 10
                            }
                        },
                        required: ['ted'],
                        additionalProperties: false
                    },
                    list: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                stringValue: {
                                    type: 'string',
                                    maxLength: 50
                                },
                                numberValue: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 1000,
                                    multipleOf: 1
                                }
                            },
                            required: [
                                'stringValue',
                                'numberValue'
                            ],
                        }
                    }
                },
                required: [
                    'key',
                    'stringValue',
                    'numberValue',
                    'nes',
                    'list'
                ],
                indexes: [
                    ['stringValue'],
                    ['numberValue'],
                    [
                        'numberValue',
                        'stringValue'
                    ]
                ],
                additionalProperties: false
            }),
            multiInstance: false,
            options: {},
            devMode: true
        });

        // await here to directly throw an error if it occurs
        await storageInstance.internals.statePromise;

        await storageInstance.bulkWrite(
            new Array(2).fill(0).map((_v, i) => ({ document: getWriteData({ key: 'a-' + i, list: [] }) })),
            writeContext
        );
        const docId = 'foobar';
        let docData = getWriteData({ key: docId });
        const writeResult = await storageInstance.bulkWrite([{ document: docData }], writeContext);
        const updateDocData = clone(writeResult.success[0]);
        await storageInstance.bulkWrite(
            new Array(2).fill(0).map((_v, i) => ({ document: getWriteData({ key: 'b-' + i, list: [] }) })),
            writeContext
        );

        // modify one
        updateDocData._rev = '2-22080c42d471e3d2625e49dcca3b8e2b';
        updateDocData._meta.lwt = now();
        const updateResult = await storageInstance.bulkWrite([{ previous: docData as any, document: updateDocData }], writeContext);

        const documentsSizeBefore = await getDocumentsSize(storageInstance);

        let cleanupDone = false;
        while (!cleanupDone) {
            cleanupDone = await storageInstance.cleanup(0);
        }

        const documentsSizeAfter = await getDocumentsSize(storageInstance);
        if (documentsSizeAfter >= documentsSizeBefore) {
            throw new Error('dev-mode: runBasicsTests() docs not cleaned up');
        }
        await storageInstance.close();
    } catch (err) {
        console.log('dev-mode: runBasicsTests() failed:');
        console.dir(err);
        await promiseWait(10000000);
        throw err;
    }
    console.log('dev-mode: runBasicsTests() DONE');
}


async function getDocumentsSize(
    instance: RxStorageInstanceAbstractFilesystem<any>
): Promise<number> {
    let size = -1;
    await instance.taskQueue.runRead(async (runState) => {
        const state = await instance.internals.statePromise;
        const accessHandle = await getAccessHandle(
            state.documentFileHandle,
            runState
        );
        size = await accessHandle.getSize();
    });
    return size;
}



export function getWriteData(
    ownParams: Partial<RxDocumentWriteData<any>> = {}
): RxDocumentWriteData<any> {
    return Object.assign(
        {
            key: randomString(10),
            stringValue: 'barfoo',
            numberValue: randomNumber(1, 100),
            nes: {
                ted: randomString(10)
            },
            list: [
                {
                    stringValue: randomString(5),
                    numberValue: randomNumber(1, 100),
                },
                {
                    stringValue: randomString(5),
                    numberValue: randomNumber(1, 100),
                }
            ],
            _deleted: false,
            _attachments: {},
            _meta: {
                lwt: now()
            },
            _rev: '1-12080c42d471e3d2625e49dcca3b8e1a'
        },
        ownParams
    );
}
