/**
 * Ring Database
 *
 * Ring-specific database setup built on top of @mongrov/db.
 * Defines ring schemas, initializes the database, and exports
 * a ringManager with typed CRUD operations for the sync machine.
 *
 * Call initializeRingDatabase() once at app startup.
 */

import { addRxPlugin, type RxJsonSchema } from 'rxdb';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

// Register external RxDB plugins
addRxPlugin(RxDBUpdatePlugin);

import { createDatabase, destroyDatabase } from '@mongrov/db';
import { open } from 'react-native-nitro-sqlite';
import { getRxStorageSQLite } from 'rxdb-premium/plugins/storage-sqlite';

/**
 * Custom RxDB SQLiteBasics wrapper for react-native-nitro-sqlite
 */
function getSQLiteBasicsNitroSQLite(openDB: any) {
  return {
    open: async (name: string) => {
      return openDB({ name });
    },
    all: async (db: any, queryWithParams: { query: string; params: any[] }) => {
      const result = await db.executeAsync(queryWithParams.query, queryWithParams.params);
      return result.rows._array;
    },
    run: async (db: any, queryWithParams: { query: string; params: any[] }) => {
      return db.executeAsync(queryWithParams.query, queryWithParams.params);
    },
    setPragma: async (db: any, key: string, value: string) => {
      return db.executeAsync(`PRAGMA ${key} = ${value}`, []);
    },
    close: async (db: any) => {
      db.close();
    },
    journalMode: '',
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type RingDocType = {
  _id: string;
  batteryLevel?: number;
  deviceVersion?: string;
  macAddress?: string;
  lastSyncDate?: string;
  lastSyncTimeStamp?: string;
  ringInfo?: Record<string, unknown>;
};

type HeartRateDocType = { date: string; singleHR?: number | string };

type SleepDocType = {
  date: string;
  unitLength?: number | string;
  quality?: number[];
};

type Spo2DocType = { date: string; automaticSpo2Data?: number | string };

type HrvDocType = {
  date: string;
  hrv?: number | string;
  stress?: number | string;
  vascularAging?: number | string;
  highBP?: number | string;
  lowBP?: number | string;
};

type TemperatureDocType = { date: string; temperature?: number | string };

type ActivityDetailsDocType = {
  date: string;
  step?: number | string;
  calories?: number | string;
  distance?: number | string;
  arraySteps?: unknown[];
};

// Minimal typed interface for the RxDB instance we create
type RingDb = {
  ring: RxCollection<RingDocType>;
  heartrate: RxCollection<HeartRateDocType>;
  sleep: RxCollection<SleepDocType>;
  spo2: RxCollection<Spo2DocType>;
  hrv: RxCollection<HrvDocType>;
  temperature: RxCollection<TemperatureDocType>;
  activitydetails: RxCollection<ActivityDetailsDocType>;
};

// Minimal RxDB collection & document shapes we rely on
type RxDocument<T> = {
  toJSON: () => T;
  update: (op: { $set: Partial<T> }) => Promise<void>;
};

type RxCollection<T> = {
  findOne: (id: string) => {
    exec: () => Promise<RxDocument<T> | null>;
    $: {
      subscribe: (cb: (doc: RxDocument<T> | null) => void) => {
        unsubscribe: () => void;
      };
    };
  };
  insert: (doc: Partial<T> & { _id?: string; date?: string }) => Promise<void>;
  bulkUpsert: (docs: T[]) => Promise<void>;
  find: () => {
    sort: (s: Record<string, string>) => {
      limit: (n: number) => {
        exec: () => Promise<RxDocument<T>[]>;
      };
    };
  };
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ringSchema: RxJsonSchema<RingDocType> = {
  title: 'ring metadata',
  version: 0,
  primaryKey: '_id',
  type: 'object',
  properties: {
    _id: { type: 'string', maxLength: 100 },
    batteryLevel: { type: 'number' },
    deviceVersion: { type: 'string' },
    macAddress: { type: 'string' },
    lastSyncDate: { type: 'string' },
    lastSyncTimeStamp: { type: 'string' },
    ringInfo: { type: 'object' },
  },
  required: ['_id'],
};

const heartRateSchema: RxJsonSchema<HeartRateDocType> = {
  title: 'heart rate data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    singleHR: { type: ['number', 'string'] },
  },
  required: ['date'],
};

const sleepSchema: RxJsonSchema<SleepDocType> = {
  title: 'sleep data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    unitLength: { type: ['number', 'string'] },
    quality: { type: 'array', items: { type: 'number' } },
  },
  required: ['date'],
};

const spo2Schema: RxJsonSchema<Spo2DocType> = {
  title: 'spo2 data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    automaticSpo2Data: { type: ['number', 'string'] },
  },
  required: ['date'],
};

const hrvSchema: RxJsonSchema<HrvDocType> = {
  title: 'hrv data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    hrv: { type: ['number', 'string'] },
    stress: { type: ['number', 'string'] },
    vascularAging: { type: ['number', 'string'] },
    highBP: { type: ['number', 'string'] },
    lowBP: { type: ['number', 'string'] },
  },
  required: ['date'],
};

const temperatureSchema: RxJsonSchema<TemperatureDocType> = {
  title: 'temperature data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    temperature: { type: ['number', 'string'] },
  },
  required: ['date'],
};

const activityDetailsSchema: RxJsonSchema<ActivityDetailsDocType> = {
  title: 'activity details data',
  version: 0,
  primaryKey: 'date',
  type: 'object',
  properties: {
    date: { type: 'string', maxLength: 100 },
    step: { type: ['number', 'string'] },
    calories: { type: ['number', 'string'] },
    distance: { type: ['number', 'string'] },
    arraySteps: { type: 'array' },
  },
  required: ['date'],
};

// ─── Database singleton ───────────────────────────────────────────────────────

let _db: RingDb | null = null;
let _initPromise: Promise<RingDb> | null = null;

export async function initializeRingDatabase(): Promise<RingDb> {
  if (_db) {
    return _db;
  }

  if (!_initPromise) {
    _initPromise = createDatabase({
      name: 'mytestapp_ring',
      storage: getRxStorageSQLite({
        sqliteBasics: getSQLiteBasicsNitroSQLite(open),
      }),
      collections: [
        { name: 'ring', schema: ringSchema },
        { name: 'heartrate', schema: heartRateSchema },
        { name: 'sleep', schema: sleepSchema },
        { name: 'spo2', schema: spo2Schema },
        { name: 'hrv', schema: hrvSchema },
        { name: 'temperature', schema: temperatureSchema },
        { name: 'activitydetails', schema: activityDetailsSchema },
      ],
      logger: console,
    })
      .then((db) => {
        _db = db as unknown as RingDb;
        console.log('[RingDB] Initialized');
        return _db;
      })
      .catch((err: unknown) => {
        _initPromise = null;
        throw err;
      });
  }

  return _initPromise;
}

export function getRingDatabase(): RingDb {
  if (!_db) {
    throw new Error('[RingDB] Not initialized. Call initializeRingDatabase() first.');
  }
  return _db;
}

export async function getRingDatabaseAsync(): Promise<RingDb> {
  if (_db) {
    return _db;
  }
  return initializeRingDatabase();
}

export async function closeRingDatabase(): Promise<void> {
  if (_db) {
    await destroyDatabase(_db as unknown as Parameters<typeof destroyDatabase>[0]);
    _db = null;
    _initPromise = null;
  }
}

// ─── Ring Manager ─────────────────────────────────────────────────────────────

const RING_DOC_ID = 'ring_metadata';

export const ringManager = {
  async getRingDocument(): Promise<RingDocType | null> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    return doc ? doc.toJSON() : null;
  },

  async initRingDocument(): Promise<void> {
    const db = await getRingDatabaseAsync();
    const existing = await db.ring.findOne(RING_DOC_ID).exec();
    if (!existing) {
      await db.ring.insert({ _id: RING_DOC_ID });
    }
  },

  async getBatteryLevel(): Promise<number | undefined> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    return doc?.toJSON().batteryLevel;
  },

  async setBatteryLevel(batteryLevel: number): Promise<void> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    if (doc) {
      await doc.update({ $set: { batteryLevel } });
    }
    else {
      await db.ring.insert({ _id: RING_DOC_ID, batteryLevel });
    }
  },

  async getDeviceVersion(): Promise<string | undefined> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    return doc?.toJSON().deviceVersion;
  },

  async setDeviceVersion(deviceVersion: string): Promise<void> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    if (doc) {
      await doc.update({ $set: { deviceVersion } });
    }
    else {
      await db.ring.insert({ _id: RING_DOC_ID, deviceVersion });
    }
  },

  async getMacAddress(): Promise<string | undefined> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    return doc?.toJSON().macAddress;
  },

  async setMacAddress(macAddress: string): Promise<void> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    if (doc) {
      await doc.update({ $set: { macAddress } });
    }
    else {
      await db.ring.insert({ _id: RING_DOC_ID, macAddress });
    }
  },

  async setLastSyncDate(lastSyncDate: string): Promise<void> {
    const db = await getRingDatabaseAsync();
    const doc = await db.ring.findOne(RING_DOC_ID).exec();
    if (doc) {
      await doc.update({ $set: { lastSyncDate } });
    }
    else {
      await db.ring.insert({ _id: RING_DOC_ID, lastSyncDate });
    }
  },

  async insertHeartRateData(data: HeartRateDocType[]): Promise<void> {
    if (!data.length) {
      return;
    }
    const db = await getRingDatabaseAsync();
    await db.heartrate.bulkUpsert(data);
  },

  async insertSleepData(data: SleepDocType[]): Promise<void> {
    if (!data.length) {
      return;
    }
    const db = await getRingDatabaseAsync();
    await db.sleep.bulkUpsert(data);
  },

  subscribeToRingChanges(callback: (doc: RingDocType | null) => void): () => void {
    const db = getRingDatabase();
    const observable = db.ring.findOne(RING_DOC_ID).$;
    const sub = observable.subscribe(
      (doc) => {
        callback(doc ? doc.toJSON() : null);
      },
    );
    return () => sub.unsubscribe();
  },
};
