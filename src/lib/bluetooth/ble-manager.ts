/**
 * BLE Manager Singleton
 * Wrapper around react-native-ble-plx providing centralized BLE state management
 */

import { BleManager, LogLevel, State } from 'react-native-ble-plx';

class BleManagerSingleton {
  private static instance: BleManagerSingleton;
  private manager: BleManager | null = null;

  private constructor() {
    // We don't initialize here to prevent premature permission popups
  }

  public static getInstance(): BleManagerSingleton {
    if (!BleManagerSingleton.instance) {
      BleManagerSingleton.instance = new BleManagerSingleton();
    }
    return BleManagerSingleton.instance;
  }

  public getManager(): BleManager {
    if (!this.manager) {
      console.log('[BLE] Initializing new BleManager instance');
      this.manager = new BleManager();

      // Enable debug logging in development
      if (__DEV__) {
        this.manager.setLogLevel(LogLevel.Debug);
      }
    }
    return this.manager;
  }

  /**
   * Check if BLE is available (physical device only)
   */
  public isAvailable(): boolean {
    return this.manager !== null;
  }

  /**
   * Check if Bluetooth is powered on
   */
  public async isBluetoothEnabled(): Promise<boolean> {
    if (!this.manager) return false;
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  /**
   * Wait for Bluetooth to be powered on
   * @param timeout Maximum time to wait in ms (default: 10000)
   */
  public waitForPoweredOn(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const manager = this.getManager();

      const subscription = manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          subscription.remove();
          resolve();
        }
      }, true);

      setTimeout(() => {
        subscription.remove();
        reject(new Error('Bluetooth power on timeout'));
      }, timeout);
    });
  }

  /**
   * Destroy the BLE manager (cleanup)
   */
  public destroy(): void {
    this.manager?.destroy();
  }
}

// Export singleton getter
export const getBleManager = () =>
  BleManagerSingleton.getInstance().getManager();

export default BleManagerSingleton;
