/**
 * useRingConnection
 * React hook wrapping the XState ringConnectionMachine
 */

import { useMachine } from '@xstate/react';
import { useCallback, useMemo } from 'react';

import type { ScannedDevice } from '@/lib/bluetooth';
import type { ConnectionContext, ConnectionStateValue } from '@/lib/bluetooth';

import { ringConnectionMachine } from '@/lib/bluetooth';

export type UseRingConnectionReturn = {
  connectionState: ConnectionStateValue;
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isDisconnecting: boolean;
  discoveredDevices: ScannedDevice[];
  deviceId: string | null;
  deviceName: string | null;
  error: string | null;
  startScan: () => void;
  stopScan: () => void;
  selectDevice: (device: ScannedDevice) => void;
  disconnect: () => void;
  retry: () => void;
  reset: () => void;
  sendConnected: () => void;
  sendConnectionLost: (error?: string) => void;
  context: ConnectionContext;
};

export function useRingConnection(): UseRingConnectionReturn {
  const [state, send] = useMachine(ringConnectionMachine);
  const connectionState = state.value as ConnectionStateValue;
  const isScanning = state.matches('scanning');
  const isConnecting = state.matches('connecting') || state.matches('retrying');
  const isConnected = state.matches('connected');
  const isDisconnecting = state.matches('disconnecting');

  const startScan = useCallback(() => send({ type: 'SCAN' }), [send]);
  const stopScan = useCallback(() => send({ type: 'STOP_SCAN' }), [send]);
  const selectDevice = useCallback(
    (device: ScannedDevice) =>
      send({
        type: 'SELECT_DEVICE',
        deviceId: device.id,
        deviceName: device.name ?? 'Unknown',
      }),
    [send],
  );
  const disconnect = useCallback(() => send({ type: 'DISCONNECT' }), [send]);
  const retry = useCallback(() => send({ type: 'RETRY' }), [send]);
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const sendConnected = useCallback(() => send({ type: 'CONNECTED' }), [send]);
  const sendConnectionLost = useCallback(
    (error?: string) => send({ type: 'CONNECTION_LOST', error }),
    [send],
  );

  return useMemo(
    () => ({
      connectionState,
      isScanning,
      isConnecting,
      isConnected,
      isDisconnecting,
      discoveredDevices: state.context.discoveredDevices,
      deviceId: state.context.deviceId,
      deviceName: state.context.deviceName,
      error: state.context.error,
      startScan,
      stopScan,
      selectDevice,
      disconnect,
      retry,
      reset,
      sendConnected,
      sendConnectionLost,
      context: state.context,
    }),
    [
      connectionState,
      isScanning,
      isConnecting,
      isConnected,
      isDisconnecting,
      state.context,
      startScan,
      stopScan,
      selectDevice,
      disconnect,
      retry,
      reset,
      sendConnected,
      sendConnectionLost,
    ],
  );
}
