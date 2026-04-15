/**
 * BLE Connector
 * Handles device connection, MTU negotiation, and reconnection
 */

import { type ConnectionOptions, type Device } from 'react-native-ble-plx';

import { getBleManager } from './ble-manager';

export interface ConnectionResult {
  device: Device;
  mtu: number;
}

export interface ConnectOptions {
  timeout?: number;
  autoConnect?: boolean;
  requestMtu?: number;
  retryCount?: number;
}

class BleConnector {
  private connectedDevice: Device | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connect to a BLE device by ID
   */
  public async connect(
    deviceId: string,
    options: ConnectOptions = {}
  ): Promise<ConnectionResult> {
    const manager = getBleManager();
    if (!manager) throw new Error('BLE Manager not available');

    const {
      timeout = 15000,
      autoConnect = false,
      requestMtu = 512,
      retryCount = 3,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(
          `[BLE Connector] Connection attempt ${attempt}/${retryCount} to ${deviceId}`
        );

        const device = await this.performConnection({
          manager,
          deviceId,
          autoConnect,
          timeout,
        });
        console.log(`[BLE Connector] Connected to ${device.name || device.id}`);

        try {
          await device.discoverAllServicesAndCharacteristics();
          const mtu = await this.negotiateMtu(device, requestMtu);

          this.connectedDevice = device;
          return { device, mtu };
        } catch (setupError) {
          console.error(
            `[BLE Connector] Post-connection setup failed for ${device.id}:`,
            setupError
          );
          // Explicitly disconnect to avoid ghost connections
          try {
            await device.cancelConnection();
          } catch (disconnectError) {
            console.warn(
              `[BLE Connector] Failed to cleanup ghost connection for ${device.id}:`,
              disconnectError
            );
          }
          throw setupError; // Re-throw to trigger retry loop
        }
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[BLE Connector] Connection attempt ${attempt} failed:`,
          error
        );
        if (attempt < retryCount) await this.delay(1000 * attempt);
      }
    }

    throw lastError || new Error('Connection failed after all retries');
  }

  private async performConnection({
    manager,
    deviceId,
    autoConnect,
    timeout,
  }: {
    manager: any;
    deviceId: string;
    autoConnect: boolean;
    timeout: number;
  }): Promise<Device> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      this.connectionTimeout = setTimeout(() => {
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);
    });

    const connectionPromise = manager.connectToDevice(deviceId, {
      autoConnect,
      timeout,
    } as ConnectionOptions);

    try {
      return await Promise.race([connectionPromise, timeoutPromise]);
    } finally {
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    }
  }

  private async negotiateMtu(
    device: Device,
    requestMtu: number
  ): Promise<number> {
    try {
      const mtuResult = await device.requestMTU(requestMtu);
      console.log(`[BLE Connector] MTU negotiated: ${mtuResult.mtu}`);
      return mtuResult.mtu;
    } catch (mtuError) {
      console.warn(
        '[BLE Connector] MTU negotiation failed, using default:',
        mtuError
      );
      return 23;
    }
  }

  /**
   * Disconnect from the currently connected device
   */
  public async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        console.log('[BLE Connector] Disconnected');
      } catch (error) {
        console.error('[BLE Connector] Disconnect error:', error);
      } finally {
        this.connectedDevice = null;
      }
    }
  }

  /**
   * Check if a device is connected
   */
  public async isConnected(deviceId?: string): Promise<boolean> {
    const manager = getBleManager();
    if (!manager) return false;

    const id = deviceId || this.connectedDevice?.id;

    if (!id) return false;

    try {
      const connected = await manager.isDeviceConnected(id);
      return connected;
    } catch {
      return false;
    }
  }

  /**
   * Get the currently connected device
   */
  public getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  /**
   * Set up connection state monitoring
   */
  public onDisconnected(
    deviceId: string,
    callback: (error: Error | null) => void
  ): () => void {
    const manager = getBleManager();
    if (!manager) {
      return () => {}; // No-op if no manager
    }

    const subscription = manager.onDeviceDisconnected(
      deviceId,
      (error, device) => {
        console.log(
          `[BLE Connector] Device disconnected: ${device?.name || deviceId}`
        );
        if (this.connectedDevice?.id === deviceId) {
          this.connectedDevice = null;
        }
        callback(error);
      }
    );

    return () => subscription.remove();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const bleConnector = new BleConnector();
export default BleConnector;
