/**
 * Ring Sync State Machine
 * XState v5 machine for managing ring data synchronization lifecycle
 */

import type {
  ActivityDataItem,
  HeartRateItem,
  HRVDataItem,
  JStyleAdapter,
  SleepDataItem,
  SpO2DataItem,
  SyncResult,
  TemperatureDataItem,
} from '../jstyle';

import { assign, fromPromise, setup } from 'xstate';

import { bleConnector } from '../ble-connector';
import { ringManager } from '../ring-db';

// ============ Types ============

export type SyncStage
  = | 'idle'
    | 'handshaking'
    | 'syncingBattery'
    | 'syncingSleep'
    | 'syncingActivity'
    | 'syncingHeartRate'
    | 'syncingHRV'
    | 'syncingSpO2'
    | 'syncingTemperature'
    | 'success'
    | 'error'
    | 'aborting';

export type SyncContext = {
  adapter: JStyleAdapter | null;
  batteryLevel: number;
  deviceVersion: string;
  currentStage: SyncStage;
  completedStages: SyncStage[];
  progress: number;
  sleepData: SleepDataItem[];
  activityData: ActivityDataItem[];
  heartRateData: HeartRateItem[];
  hrvData: HRVDataItem[];
  spo2Data: SpO2DataItem[];
  temperatureData: TemperatureDataItem[];
  lastSyncTime: Date | null;
  error: string | null;
};

export type SyncEvent
  = | { type: 'START_SYNC'; adapter: JStyleAdapter }
    | { type: 'ABORT' }
    | { type: 'RESET' }
    | { type: 'RETRY'; adapter: JStyleAdapter };

const initialContext: SyncContext = {
  adapter: null,
  batteryLevel: -1,
  deviceVersion: '',
  currentStage: 'idle',
  completedStages: [],
  progress: 0,
  sleepData: [],
  activityData: [],
  heartRateData: [],
  hrvData: [],
  spo2Data: [],
  temperatureData: [],
  lastSyncTime: null,
  error: null,
};

// ============ Actors ============

const performHandshake = fromPromise<boolean, { adapter: JStyleAdapter }>(
  async ({ input }) => input.adapter.handshake(),
);

const syncBattery = fromPromise<
  { battery: number; version: string },
  { adapter: JStyleAdapter }
>(async ({ input }) => {
  const battery = await input.adapter.getBatteryLevel();
  const version = await input.adapter.getDeviceVersion();

  // Persist to RxDB
  try {
    await ringManager.initRingDocument();
    await ringManager.setBatteryLevel(battery);
    await ringManager.setDeviceVersion(version);

    // Persist MAC address / device UUID
    const connectedDevice = bleConnector.getConnectedDevice();
    if (connectedDevice?.id) {
      await ringManager.setMacAddress(connectedDevice.id);
    }
    console.log('[RingSyncMachine] Persisted battery, version, MAC to RxDB');
  }
  catch (e) {
    console.warn('[RingSyncMachine] Failed to persist device info to RxDB:', e);
  }

  return { battery, version };
});

const syncSleep = fromPromise<
  SyncResult<SleepDataItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncSleepData());

const syncActivity = fromPromise<
  SyncResult<ActivityDataItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncActivityData());

const syncHeartRate = fromPromise<
  SyncResult<HeartRateItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncHeartRateData());

const syncHRV = fromPromise<
  SyncResult<HRVDataItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncHRVData());

const syncSpO2 = fromPromise<
  SyncResult<SpO2DataItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncSpO2Data());

const syncTemperature = fromPromise<
  SyncResult<TemperatureDataItem>,
  { adapter: JStyleAdapter }
>(async ({ input }) => input.adapter.syncTemperatureData());

const abortSync = fromPromise<void, { adapter: JStyleAdapter | null }>(
  async ({ input }) => {
    if (input.adapter) {
      await input.adapter.abortSync();
    }
  },
);

// ============ Progress Map ============

const STAGE_PROGRESS: Record<SyncStage, number> = {
  idle: 0,
  handshaking: 5,
  syncingBattery: 10,
  syncingSleep: 25,
  syncingActivity: 40,
  syncingHeartRate: 55,
  syncingHRV: 70,
  syncingSpO2: 85,
  syncingTemperature: 95,
  success: 100,
  error: 0,
  aborting: 0,
};

// ============ Machine ============

export const ringSyncMachine = setup({
  types: {} as { context: SyncContext; events: SyncEvent },
  actors: {
    performHandshake,
    syncBattery,
    syncSleep,
    syncActivity,
    syncHeartRate,
    syncHRV,
    syncSpO2,
    syncTemperature,
    abortSync,
  },
  actions: {
    setAdapter: assign({
      adapter: ({ event }) => ('adapter' in event ? event.adapter : null),
    }),
    setStage: assign({
      currentStage: (_, params: { stage: SyncStage }) => params.stage,
      progress: (_, params: { stage: SyncStage }) =>
        STAGE_PROGRESS[params.stage],
    }),
    addCompletedStage: assign({
      completedStages: ({ context }, params: { stage: SyncStage }) =>
        context.completedStages.includes(params.stage)
          ? context.completedStages
          : [...context.completedStages, params.stage],
    }),
    setError: assign({
      error: () => 'Sync failed',
      currentStage: 'error' as SyncStage,
    }),
    setSuccess: assign({
      currentStage: 'success' as SyncStage,
      progress: 100,
      lastSyncTime: () => new Date(),
    }),
    logSyncComplete: () => {
      console.log('[JStyle] Full sync complete');
    },
    resetContext: assign(initialContext),
    resetRunContext: assign({
      completedStages: () => [],
      progress: () => 0,
      currentStage: () => 'idle' as SyncStage,
      sleepData: () => [],
      activityData: () => [],
      heartRateData: () => [],
      hrvData: () => [],
      spo2Data: () => [],
      temperatureData: () => [],
      error: () => null,
    }),
  },
}).createMachine({
  id: 'ringSync',
  initial: 'idle',
  context: initialContext,
  on: {
    RESET: {
      target: '.idle',
      actions: 'resetContext',
    },
  },
  states: {
    idle: {
      on: {
        START_SYNC: {
          target: 'handshaking',
          actions: [
            'resetRunContext',
            'setAdapter',
            { type: 'setStage', params: { stage: 'handshaking' as SyncStage } },
          ],
        },
      },
    },
    handshaking: {
      invoke: {
        id: 'performHandshake',
        src: 'performHandshake',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingBattery',
          actions: [
            {
              type: 'addCompletedStage',
              params: { stage: 'handshaking' as SyncStage },
            },
            {
              type: 'setStage',
              params: { stage: 'syncingBattery' as SyncStage },
            },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingBattery: {
      invoke: {
        id: 'syncBattery',
        src: 'syncBattery',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingSleep',
          actions: [
            assign({
              batteryLevel: ({ event }) => event.output.battery,
              deviceVersion: ({ event }) => event.output.version,
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingBattery' as SyncStage },
            },
            {
              type: 'setStage',
              params: { stage: 'syncingSleep' as SyncStage },
            },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingSleep: {
      invoke: {
        id: 'syncSleep',
        src: 'syncSleep',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingActivity',
          actions: [
            assign({
              sleepData: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingSleep' as SyncStage },
            },
            {
              type: 'setStage',
              params: { stage: 'syncingActivity' as SyncStage },
            },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingActivity: {
      invoke: {
        id: 'syncActivity',
        src: 'syncActivity',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingHeartRate',
          actions: [
            assign({
              activityData: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingActivity' as SyncStage },
            },
            {
              type: 'setStage',
              params: { stage: 'syncingHeartRate' as SyncStage },
            },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingHeartRate: {
      invoke: {
        id: 'syncHeartRate',
        src: 'syncHeartRate',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingHRV',
          actions: [
            assign({
              heartRateData: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingHeartRate' as SyncStage },
            },
            { type: 'setStage', params: { stage: 'syncingHRV' as SyncStage } },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingHRV: {
      invoke: {
        id: 'syncHRV',
        src: 'syncHRV',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingSpO2',
          actions: [
            assign({
              hrvData: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingHRV' as SyncStage },
            },
            { type: 'setStage', params: { stage: 'syncingSpO2' as SyncStage } },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingSpO2: {
      invoke: {
        id: 'syncSpO2',
        src: 'syncSpO2',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'syncingTemperature',
          actions: [
            assign({
              spo2Data: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingSpO2' as SyncStage },
            },
            {
              type: 'setStage',
              params: { stage: 'syncingTemperature' as SyncStage },
            },
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    syncingTemperature: {
      invoke: {
        id: 'syncTemperature',
        src: 'syncTemperature',
        input: ({ context }) => ({ adapter: context.adapter! }),
        onDone: {
          target: 'success',
          actions: [
            assign({
              temperatureData: ({ event }) =>
                event.output.success ? event.output.data : [],
            }),
            {
              type: 'addCompletedStage',
              params: { stage: 'syncingTemperature' as SyncStage },
            },
            'setSuccess',
            'logSyncComplete',
          ],
        },
        onError: { target: 'error', actions: 'setError' },
      },
      on: { ABORT: 'aborting' },
    },
    success: {
      on: {
        RESET: { target: 'idle', actions: 'resetContext' },
        START_SYNC: {
          target: 'handshaking',
          actions: [
            'setAdapter',
            { type: 'setStage', params: { stage: 'handshaking' as SyncStage } },
          ],
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: 'handshaking',
          actions: [
            'setAdapter',
            { type: 'setStage', params: { stage: 'handshaking' as SyncStage } },
          ],
        },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    aborting: {
      invoke: {
        id: 'abortSync',
        src: 'abortSync',
        input: ({ context }) => ({ adapter: context.adapter }),
        onDone: { target: 'idle', actions: 'resetContext' },
        onError: { target: 'idle', actions: 'resetContext' },
      },
    },
  },
});

export type RingSyncMachine = typeof ringSyncMachine;
