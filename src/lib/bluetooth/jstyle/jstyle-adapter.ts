/**
 * JStyle Protocol Adapter
 * High-level adapter that connects the packet builder/parser to the BLE layer
 */

import type {
  Characteristic,
  Device,
  Subscription,
} from 'react-native-ble-plx';

import { Buffer } from 'buffer';

import { CMD, MODE, PacketBuilder } from './packet-builder';
import type {
  ActivityDataItem,
  HeartRateItem,
  HRVDataItem,
  SleepDataItem,
  SpO2DataItem,
  TemperatureDataItem,
} from './response-parser';
import { ResponseParser } from './response-parser';

// JStyle UUIDs (Derived from logs: Service FFF0, Write FFF6, Notify FFF7)
export const JSTYLE_SERVICE_UUID = 'fff0';
export const JSTYLE_WRITE_CHAR_UUID = 'fff6';
export const JSTYLE_NOTIFY_CHAR_UUID = 'fff7';

export type SyncResult<T> = {
  success: boolean;
  data: T[];
  error?: string;
};

export class JStyleAdapter {
  private device: Device;
  private writeCharacteristic: Characteristic | null = null;
  private notifyCharacteristic: Characteristic | null = null;
  private notificationSubscription: Subscription | null = null;
  private responseBuffer: Uint8Array[] = [];
  private responseResolver: ((data: Uint8Array[]) => void) | null = null;
  private responseTimeout: ReturnType<typeof setTimeout> | null = null;
  private expectedResponseCount: number = 0;
  private isSyncCancelled: boolean = false;

  constructor(device: Device) {
    this.device = device;
  }

  /**
   * Initialize the adapter by discovering and caching characteristics
   */
  public async initialize(): Promise<void> {
    console.log('[JStyle] Initializing adapter...');

    const services = await this.device.services();

    for (const service of services) {
      const serviceUuid = service.uuid.toLowerCase();
      console.log(`[JStyle] Found service: ${serviceUuid}`);

      if (serviceUuid.includes(JSTYLE_SERVICE_UUID)) {
        const characteristics = await service.characteristics();

        for (const char of characteristics) {
          const charUuid = char.uuid.toLowerCase();
          console.log(
            `[JStyle] Found characteristic: ${charUuid} (write: ${char.isWritableWithResponse || char.isWritableWithoutResponse}, notify: ${char.isNotifiable})`,
          );

          if (charUuid.includes(JSTYLE_WRITE_CHAR_UUID)) {
            this.writeCharacteristic = char;
          }
          else if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            if (!this.writeCharacteristic) this.writeCharacteristic = char;
          }

          if (charUuid.includes(JSTYLE_NOTIFY_CHAR_UUID)) {
            this.notifyCharacteristic = char;
          }
          else if (char.isNotifiable) {
            if (!this.notifyCharacteristic) this.notifyCharacteristic = char;
          }
        }

        if (this.writeCharacteristic && this.notifyCharacteristic) {
          console.log(
            '[JStyle] Found matching Command Service characteristics, stopping search.',
          );
          break;
        }
      }
    }

    if (!this.writeCharacteristic || !this.notifyCharacteristic) {
      throw new Error('[JStyle] Required characteristics not found');
    }

    await this.setupNotifications();
    console.log('[JStyle] Adapter initialized successfully');
  }

  /**
   * Resolve pending response promise
   */
  private resolveResponse(): void {
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }

    if (this.responseResolver) {
      const resolver = this.responseResolver;
      const data = [...this.responseBuffer];
      this.responseBuffer = [];
      this.responseResolver = null;
      this.expectedResponseCount = 0;
      resolver(data);
    }
  }

  /**
   * Send a command and wait for response(s)
   */
  private async sendCommand(
    packet: Uint8Array,
    timeout: number = 3000,
    expectedPackets: number = 0,
  ): Promise<Uint8Array[]> {
    if (!this.writeCharacteristic) {
      throw new Error('[JStyle] Write characteristic not available');
    }

    if (!this.notificationSubscription) {
      console.warn('[JStyle] Notification listener missing, re-initializing...');
      await this.setupNotifications();
    }

    this.responseBuffer = [];
    this.expectedResponseCount = expectedPackets;

    return new Promise((resolve, reject) => {
      this.responseResolver = resolve;

      this.responseTimeout = setTimeout(() => {
        if (this.responseResolver) {
          const data = [...this.responseBuffer];
          this.responseBuffer = [];
          this.responseResolver = null;
          this.expectedResponseCount = 0;
          console.log(
            `[JStyle] Command timeout (0x${packet[0].toString(16)}). Received ${data.length} packets.`,
          );
          resolve(data);
        }
      }, timeout);

      const base64Data = Buffer.from(packet).toString('base64');
      this.writeCharacteristic!.writeWithResponse(base64Data)
        .then(() => {
          console.log(`[JStyle] Sent command: 0x${packet[0].toString(16)}`);
        })
        .catch((error: unknown) => {
          this.responseResolver = null;
          this.expectedResponseCount = 0;
          if (this.responseTimeout) {
            clearTimeout(this.responseTimeout);
          }
          reject(error);
        });
    });
  }

  /**
   * Set up notification handling
   */
  private async setupNotifications(): Promise<void> {
    if (!this.notifyCharacteristic) return;

    if (this.notificationSubscription) {
      console.log('[JStyle] Removing existing notification subscription');
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }

    this.notificationSubscription = this.notifyCharacteristic.monitor(
      (error, char) => {
        if (!this.notificationSubscription) return;

        if (error) {
          if (error.errorCode === 201) return;
          if (error.message?.includes('cancelled')) return;
          console.error('[JStyle] Notification error:', error);
          return;
        }

        if (char?.value) {
          const data = Buffer.from(char.value, 'base64');
          const packet = new Uint8Array(data);
          const hex = Buffer.from(packet).toString('hex');
          console.log(`[JStyle] Received ${packet.length} bytes: ${hex}`);

          this.responseBuffer.push(packet);

          if (this.responseResolver) {
            const isEnd = ResponseParser.isEndMarker(packet);
            const isEmpty = ResponseParser.isEmptyDataResponse(packet);
            const metExpectedCount
              = this.expectedResponseCount > 0
              && this.responseBuffer.length >= this.expectedResponseCount;

            if (isEnd || isEmpty || metExpectedCount) {
              this.resolveResponse();
            }
          }
        }
      },
    );

    console.log('[JStyle] Notifications setup complete');
  }

  /**
   * Concatenate response packets into a single buffer
   */
  private concatResponses(responses: Uint8Array[]): Uint8Array {
    const totalLength = responses.reduce((sum, r) => sum + r.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const response of responses) {
      result.set(response, offset);
      offset += response.length;
    }
    return result;
  }

  // ============ High-Level API ============

  public async handshake(): Promise<boolean> {
    try {
      const packet = PacketBuilder.setDeviceTime();
      const responses = await this.sendCommand(packet, 2000, 1);
      const validResponse = responses.find((r) => r[0] === CMD.SET_TIME);
      if (validResponse) {
        console.log('[JStyle] Handshake complete (ACK received)');
      }
      else {
        console.warn('[JStyle] Handshake response missing or mismatch');
      }
      return true;
    }
    catch (error) {
      console.error('[JStyle] Handshake failed:', error);
      return false;
    }
  }

  public async getBatteryLevel(): Promise<number> {
    const packet = PacketBuilder.getBatteryLevel();
    const responses = await this.sendCommand(packet, 2000, 1);
    const validResponse = responses.find(
      (r) => r[0] === CMD.GET_BATTERY_LEVEL,
    );
    if (validResponse) {
      const data = ResponseParser.parseBattery(validResponse);
      return data.level;
    }
    return -1;
  }

  public async getDeviceVersion(): Promise<string> {
    const packet = PacketBuilder.getDeviceVersion();
    const responses = await this.sendCommand(packet, 2000, 1);
    const validResponse = responses.find((r) => r[0] === CMD.GET_VERSION);
    if (validResponse) {
      const data = ResponseParser.parseDeviceVersion(validResponse);
      return data.version;
    }
    return 'Unknown';
  }

  public async syncSleepData(): Promise<SyncResult<SleepDataItem>> {
    const allItems: SleepDataItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getDetailSleepData(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        for (const response of responses) {
          const result = ResponseParser.parseSleepData(response);
          allItems.push(...result.items);
          if (result.isEnd) {
            isEnd = true;
            break;
          }
        }

        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncActivityData(): Promise<SyncResult<ActivityDataItem>> {
    const allItems: ActivityDataItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getDetailActivityData(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        const combined = this.concatResponses(responses);
        const result = ResponseParser.parseDetailActivityData(combined);

        allItems.push(...result.items);
        isEnd = result.isEnd;
        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncHeartRateData(): Promise<SyncResult<HeartRateItem>> {
    const allItems: HeartRateItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getStaticHR(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        const combined = this.concatResponses(responses);
        const result = ResponseParser.parseStaticHR(combined);

        allItems.push(...result.items);
        isEnd = result.isEnd;
        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncHRVData(): Promise<SyncResult<HRVDataItem>> {
    const allItems: HRVDataItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getHRVData(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        const combined = this.concatResponses(responses);
        const result = ResponseParser.parseHRVData(combined);

        allItems.push(...result.items);
        isEnd = result.isEnd;
        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncSpO2Data(): Promise<SyncResult<SpO2DataItem>> {
    const allItems: SpO2DataItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getSpO2Data(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        const combined = this.concatResponses(responses);
        const result = ResponseParser.parseSpO2Data(combined);

        allItems.push(...result.items);
        isEnd = result.isEnd;
        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncTemperatureData(): Promise<SyncResult<TemperatureDataItem>> {
    const allItems: TemperatureDataItem[] = [];
    let isEnd = false;
    let mode = MODE.READ_START;
    this.isSyncCancelled = false;

    try {
      while (!isEnd) {
        if (this.isSyncCancelled) throw new Error('Sync cancelled');

        const packet = PacketBuilder.getTemperatureData(mode);
        const responses = await this.sendCommand(packet, 3000);

        if (responses.length === 0) break;

        const combined = this.concatResponses(responses);
        const result = ResponseParser.parseTemperatureData(combined);

        allItems.push(...result.items);
        isEnd = result.isEnd;
        mode = MODE.READ_CONTINUE;
      }

      return { success: true, data: allItems };
    }
    catch (error) {
      return { success: false, data: allItems, error: String(error) };
    }
  }

  public async syncAll(): Promise<{
    sleep: SyncResult<SleepDataItem>;
    activity: SyncResult<ActivityDataItem>;
    heartRate: SyncResult<HeartRateItem>;
    hrv: SyncResult<HRVDataItem>;
    spo2: SyncResult<SpO2DataItem>;
    temperature: SyncResult<TemperatureDataItem>;
  }> {
    console.log('[JStyle] Starting full sync...');

    if (!this.notificationSubscription) {
      await this.setupNotifications();
    }

    const sleep = await this.syncSleepData();
    const activity = await this.syncActivityData();
    const heartRate = await this.syncHeartRateData();
    const hrv = await this.syncHRVData();
    const spo2 = await this.syncSpO2Data();
    const temperature = await this.syncTemperatureData();

    console.log('[JStyle] Full sync complete');

    return { sleep, activity, heartRate, hrv, spo2, temperature };
  }

  public async abortSync(): Promise<void> {
    this.isSyncCancelled = true;
    if (!this.writeCharacteristic) return;
    console.log('[JStyle] Aborting sync...');

    try {
      const packet = PacketBuilder.setDeviceTime();
      const base64Data = Buffer.from(packet).toString('base64');

      if (this.writeCharacteristic.isWritableWithResponse) {
        await this.writeCharacteristic.writeWithResponse(base64Data);
      }
      else if (this.writeCharacteristic.isWritableWithoutResponse) {
        await this.writeCharacteristic.writeWithoutResponse(base64Data);
      }
      else {
        await this.writeCharacteristic.writeWithResponse(base64Data);
      }
      console.log('[JStyle] Abort command sent');
    }
    catch (error) {
      console.warn('[JStyle] Failed to send abort packet (ignoring):', error);
    }
  }

  public cleanup(): void {
    console.log('[JStyle] Cleaning up adapter...');

    if (this.notificationSubscription) {
      console.log('[JStyle] Removing notification subscription');
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }

    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }

    this.responseResolver = null;
    this.responseBuffer = [];
  }
}

export default JStyleAdapter;
