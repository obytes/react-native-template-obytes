import { ringManager, initializeRingDatabase, getRingDatabase, closeRingDatabase } from '../ring-db';
import { createDatabase, destroyDatabase } from '@mongrov/db';

// Mock @mongrov/db
jest.mock('@mongrov/db', () => ({
  createDatabase: jest.fn(),
  destroyDatabase: jest.fn(),
}));

// Mock rxdb
jest.mock('rxdb', () => ({
  addRxPlugin: jest.fn(),
}));

// Mock react-native-nitro-sqlite
jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn(),
}));

// Mock rxdb-premium
jest.mock('rxdb-premium/plugins/storage-sqlite', () => ({
  getRxStorageSQLite: jest.fn(),
}));

describe('RingDB', () => {
  let mockDb: any;
  let mockRingCollection: any;
  let mockHeartRateCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRingCollection = {


      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      insert: jest.fn(),
      $: {
        subscribe: jest.fn(),
      },
    };

    mockHeartRateCollection = {
      bulkUpsert: jest.fn(),
    };

    mockDb = {
      ring: mockRingCollection,
      heartrate: mockHeartRateCollection,
      sleep: { bulkUpsert: jest.fn() },
    };

    (createDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(async () => {
    await closeRingDatabase();
  });


  describe('initialization', () => {
    it('initializes the database once', async () => {
      await initializeRingDatabase();
      await initializeRingDatabase();
      expect(createDatabase).toHaveBeenCalledTimes(1);
    });

    it('returns the database instance', async () => {
      const db = await initializeRingDatabase();
      expect(db).toBe(mockDb);
    });

    it('throws if getRingDatabase is called before init', () => {
      expect(() => getRingDatabase()).toThrow('[RingDB] Not initialized');
    });
  });

  describe('ringManager', () => {
    const RING_DOC_ID = 'ring_metadata';

    beforeEach(async () => {
      await initializeRingDatabase();
    });

    describe('getBatteryLevel', () => {
      it('returns battery level from document', async () => {
        mockRingCollection.exec.mockResolvedValue({
          toJSON: () => ({ batteryLevel: 80 }),
        });

        const level = await ringManager.getBatteryLevel();
        expect(level).toBe(80);
      });

      it('returns undefined if doc not found', async () => {
        mockRingCollection.exec.mockResolvedValue(null);
        const level = await ringManager.getBatteryLevel();
        expect(level).toBeUndefined();
      });
    });

    describe('setBatteryLevel', () => {
      it('updates existing document', async () => {
        const mockUpdate = jest.fn();
        mockRingCollection.exec.mockResolvedValue({
          update: mockUpdate,
        });

        await ringManager.setBatteryLevel(90);
        expect(mockUpdate).toHaveBeenCalledWith({ $set: { batteryLevel: 90 } });
      });

      it('inserts new document if missing', async () => {
        mockRingCollection.exec.mockResolvedValue(null);
        await ringManager.setBatteryLevel(90);
        expect(mockRingCollection.insert).toHaveBeenCalledWith({
          _id: RING_DOC_ID,
          batteryLevel: 90,
        });
      });
    });

    describe('insertHeartRateData', () => {
      it('calls bulkUpsert with data', async () => {
        const data = [{ date: '...', singleHR: 70 }];
        await ringManager.insertHeartRateData(data);
        expect(mockHeartRateCollection.bulkUpsert).toHaveBeenCalledWith(data);
      });

      it('skips if data is empty', async () => {
        await ringManager.insertHeartRateData([]);
        expect(mockHeartRateCollection.bulkUpsert).not.toHaveBeenCalled();
      });
    });

    describe('getDeviceVersion', () => {
      it('returns version from document', async () => {
        mockRingCollection.exec.mockResolvedValue({
          toJSON: () => ({ deviceVersion: '1.0.0' }),
        });
        expect(await ringManager.getDeviceVersion()).toBe('1.0.0');
      });
    });

    describe('setDeviceVersion', () => {
      it('updates version', async () => {
        const mockUpdate = jest.fn();
        mockRingCollection.exec.mockResolvedValue({ update: mockUpdate });
        await ringManager.setDeviceVersion('1.2.3');
        expect(mockUpdate).toHaveBeenCalledWith({ $set: { deviceVersion: '1.2.3' } });
      });
    });

    describe('getMacAddress', () => {
      it('returns mac from document', async () => {
        mockRingCollection.exec.mockResolvedValue({
          toJSON: () => ({ macAddress: 'AA:BB' }),
        });
        expect(await ringManager.getMacAddress()).toBe('AA:BB');
      });
    });

    describe('setMacAddress', () => {
      it('updates mac', async () => {
        const mockUpdate = jest.fn();
        mockRingCollection.exec.mockResolvedValue({ update: mockUpdate });
        await ringManager.setMacAddress('CC:DD');
        expect(mockUpdate).toHaveBeenCalledWith({ $set: { macAddress: 'CC:DD' } });
      });
    });

    describe('setLastSyncDate', () => {
      it('updates lastSyncDate', async () => {
        const mockUpdate = jest.fn();
        mockRingCollection.exec.mockResolvedValue({ update: mockUpdate });
        await ringManager.setLastSyncDate('2023-01-01');
        expect(mockUpdate).toHaveBeenCalledWith({ $set: { lastSyncDate: '2023-01-01' } });
      });
    });

    describe('insertSleepData', () => {
      it('calls bulkUpsert for sleep collection', async () => {
        const data = [{ date: '...', quality: [1, 2] }];
        await ringManager.insertSleepData(data);
        expect(mockDb.sleep.bulkUpsert).toHaveBeenCalledWith(data);
      });
    });

    describe('subscribeToRingChanges', () => {
      it('subscribes to findOne observable', () => {
        const mockUnsubscribe = jest.fn();
        mockRingCollection.$.subscribe.mockReturnValue({
          unsubscribe: mockUnsubscribe,
        });

        const callback = jest.fn();
        const unsubscribe = ringManager.subscribeToRingChanges(callback);
        
        expect(mockRingCollection.$.subscribe).toHaveBeenCalled();
        unsubscribe();
        expect(mockUnsubscribe).toHaveBeenCalled();
      });

      it('executes callback with JSON data', () => {
        let capturedCallback: any;
        mockRingCollection.$.subscribe.mockImplementation((cb: any) => {
          capturedCallback = cb;
          return { unsubscribe: jest.fn() };
        });

        const callback = jest.fn();
        ringManager.subscribeToRingChanges(callback);
        
        capturedCallback({ toJSON: () => ({ _id: RING_DOC_ID, batteryLevel: 50 }) });
        expect(callback).toHaveBeenCalledWith({ _id: RING_DOC_ID, batteryLevel: 50 });

        capturedCallback(null);
        expect(callback).toHaveBeenCalledWith(null);
      });
    });
  });
});

