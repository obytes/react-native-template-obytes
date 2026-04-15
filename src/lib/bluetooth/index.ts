/**
 * Bluetooth Module
 * Export all BLE utilities from a single entry point
 */

export type { ConnectionResult, ConnectOptions } from './ble-connector';
export { bleConnector } from './ble-connector';
export { getBleManager } from './ble-manager';
export type { PermissionStatus } from './ble-permissions';
export { blePermissions } from './ble-permissions';
export type { ScannedDevice, ScanOptions } from './ble-scanner';
export { bleScanner, ZIVA_RING_NAMES_REGEX } from './ble-scanner';

// JStyle BLE protocol
export type {
  ActivityDataItem,
  BatteryData,
  DeviceTimeData,
  DeviceVersionData,
  HeartRateItem,
  HRVDataItem,
  SleepDataItem,
  SpO2DataItem,
  SyncResult,
  TemperatureDataItem,
} from './jstyle';
export {
  JSTYLE_NOTIFY_CHAR_UUID,
  JSTYLE_SERVICE_UUID,
  JSTYLE_WRITE_CHAR_UUID,
  JStyleAdapter,
  PacketBuilder,
  ResponseParser,
} from './jstyle';

// XState machines
export type {
  ConnectionContext,
  ConnectionEvent,
  ConnectionStateValue,
  RingConnectionMachine,
} from './machines/ring-connection-machine';
export { ringConnectionMachine } from './machines/ring-connection-machine';
export type {
  RingSyncMachine,
  SyncContext,
  SyncEvent,
  SyncStage,
} from './machines/ring-sync-machine';
export { ringSyncMachine } from './machines/ring-sync-machine';

// Ring database & manager
export {
  closeRingDatabase,
  getRingDatabase,
  getRingDatabaseAsync,
  initializeRingDatabase,
  ringManager,
} from './ring-db';
