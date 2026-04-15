/**
 * Ring Connection State Machine
 * XState v5 machine for managing BLE ring connection lifecycle
 */

import { assign, fromPromise, setup } from 'xstate';

import type { ScannedDevice } from '../ble-scanner';
import { bleConnector } from '../ble-connector';
import { bleScanner } from '../ble-scanner';

// ============ Types ============

export type ConnectionStateValue
  = | 'disconnected'
    | 'scanning'
    | 'connecting'
    | 'connected'
    | 'disconnecting'
    | 'error';

export type ConnectionContext = {
  deviceId: string | null;
  deviceName: string | null;
  discoveredDevices: ScannedDevice[];
  error: string | null;
  retryCount: number;
};

export type ConnectionEvent
  = | { type: 'SCAN' }
    | { type: 'STOP_SCAN' }
    | { type: 'DEVICE_FOUND'; device: ScannedDevice }
    | { type: 'SELECT_DEVICE'; deviceId: string; deviceName: string }
    | { type: 'CONNECTED' }
    | { type: 'DISCONNECT' }
    | { type: 'DISCONNECTED' }
    | { type: 'CONNECTION_LOST'; error?: string }
    | { type: 'ERROR'; error: string }
    | { type: 'RETRY' }
    | { type: 'RESET' };

// ============ Actors (async services) ============

const scanForDevices = fromPromise<
  ScannedDevice[],
  { emit: (event: ConnectionEvent) => void }
>(async ({ input }) => {
  const devices = await bleScanner.startScan({
    timeout: 10000,
    filterZivaOnly: true,
    onDeviceFound: (device) => {
      input.emit({ type: 'DEVICE_FOUND', device });
    },
  });
  return devices;
});

const connectToDevice = fromPromise<
  { deviceId: string; deviceName: string },
  { deviceId: string; deviceName: string }
>(async ({ input }) => {
  // Stop scanning before connecting
  bleScanner.stopScan();

  const result = await bleConnector.connect(input.deviceId, {
    timeout: 15000,
    retryCount: 3,
  });

  return {
    deviceId: result.device.id,
    deviceName:
      result.device.name || result.device.localName || input.deviceName,
  };
});

const disconnectDevice = fromPromise<void, void>(async () => {
  await bleConnector.disconnect();
});

// ============ Machine Definition ============

export const ringConnectionMachine = setup({
  types: {} as {
    context: ConnectionContext;
    events: ConnectionEvent;
  },
  actors: {
    scanForDevices,
    connectToDevice,
    disconnectDevice,
  },
  actions: {
    addDevice: assign({
      discoveredDevices: ({ context, event }) => {
        if (event.type !== 'DEVICE_FOUND') return context.discoveredDevices;
        const exists = context.discoveredDevices.some(
          (d) => d.id === event.device.id,
        );
        if (exists) {
          return context.discoveredDevices;
        }
        return [...context.discoveredDevices, event.device];
      },
    }),
    setConnectedDevice: assign({
      deviceId: ({ event }) =>
        event.type === 'SELECT_DEVICE' || event.type === 'CONNECTED'
          ? ((event as { deviceId?: string }).deviceId ?? null)
          : null,
      deviceName: ({ event }) =>
        event.type === 'SELECT_DEVICE' || event.type === 'CONNECTED'
          ? ((event as { deviceName?: string }).deviceName ?? null)
          : null,
    }),
    setError: assign({
      error: ({ event }) => (event.type === 'ERROR' ? event.error : null),
    }),
    setConnectionLostError: assign({
      error: ({ event }) =>
        event.type === 'CONNECTION_LOST'
          ? (event.error ?? 'Connection lost')
          : null,
    }),
    clearDevices: assign({ discoveredDevices: [] }),
    clearError: assign({ error: null }),
    clearConnection: assign({
      deviceId: null,
      deviceName: null,
      retryCount: 0,
    }),
    incrementRetry: assign({
      retryCount: ({ context }) => context.retryCount + 1,
    }),
    stopScanning: () => {
      bleScanner.stopScan();
    },
  },
  guards: {
    canRetry: ({ context }) => context.retryCount < 3,
  },
}).createMachine({
  id: 'ringConnection',
  initial: 'disconnected',
  context: {
    deviceId: null,
    deviceName: null,
    discoveredDevices: [],
    error: null,
    retryCount: 0,
  },
  states: {
    disconnected: {
      entry: ['clearConnection', 'clearError'],
      on: {
        SCAN: {
          target: 'scanning',
          actions: 'clearDevices',
        },
        SELECT_DEVICE: {
          target: 'connecting',
          actions: [
            assign({
              deviceId: ({ event }) => event.deviceId,
              deviceName: ({ event }) => event.deviceName,
            }),
          ],
        },
      },
    },

    scanning: {
      invoke: {
        id: 'scanner',
        src: 'scanForDevices',
        input: ({ self }) => ({
          emit: (event: ConnectionEvent) => self.send(event),
        }),
        onDone: { target: 'disconnected' },
        onError: {
          target: 'error',
          actions: assign({ error: ({ event }) => String(event.error) }),
        },
      },
      on: {
        DEVICE_FOUND: { actions: 'addDevice' },
        STOP_SCAN: {
          target: 'disconnected',
          actions: 'stopScanning',
        },
        SELECT_DEVICE: {
          target: 'connecting',
          actions: [
            'stopScanning',
            assign({
              deviceId: ({ event }) => event.deviceId,
              deviceName: ({ event }) => event.deviceName,
            }),
          ],
        },
      },
    },

    connecting: {
      invoke: {
        id: 'connector',
        src: 'connectToDevice',
        input: ({ context }) => ({
          deviceId: context.deviceId!,
          deviceName: context.deviceName || 'Unknown',
        }),
        onDone: {
          target: 'connected',
          actions: assign({
            deviceId: ({ event }) => event.output.deviceId,
            deviceName: ({ event }) => event.output.deviceName,
          }),
        },
        onError: [
          {
            guard: 'canRetry',
            target: 'retrying',
            actions: assign({ error: ({ event }) => String(event.error) }),
          },
          {
            target: 'error',
            actions: assign({ error: ({ event }) => String(event.error) }),
          },
        ],
      },
      on: {
        DISCONNECT: 'disconnected',
      },
    },

    retrying: {
      entry: 'incrementRetry',
      after: {
        1000: 'connecting',
      },
      on: {
        DISCONNECT: 'disconnected',
      },
    },

    connected: {
      on: {
        DISCONNECT: 'disconnecting',
        CONNECTION_LOST: {
          target: 'error',
          actions: 'setConnectionLostError',
        },
      },
    },

    disconnecting: {
      invoke: {
        id: 'disconnector',
        src: 'disconnectDevice',
        onDone: 'disconnected',
        onError: {
          target: 'disconnected',
          actions: assign({ error: ({ event }) => String(event.error) }),
        },
      },
    },

    error: {
      on: {
        RETRY: 'disconnected',
        RESET: 'disconnected',
        SCAN: {
          target: 'scanning',
          actions: ['clearDevices', 'clearError'],
        },
      },
    },
  },
});

export type RingConnectionMachine = typeof ringConnectionMachine;
