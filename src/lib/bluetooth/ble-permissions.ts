/**
 * BLE Permissions Manager
 * Handles platform-specific permission requests for Bluetooth and Location
 */

import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';

import { storage } from '@/lib/storage';

import { getBleManager } from './ble-manager';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'blocked';

const HAS_REQUESTED_BLE = 'has_requested_ble';
const BLE_DENIED_IOS = 'ble_denied_ios';

class BlePermissions {
  private static instance: BlePermissions;

  private constructor() {}

  public static getInstance(): BlePermissions {
    if (!BlePermissions.instance) {
      BlePermissions.instance = new BlePermissions();
    }
    return BlePermissions.instance;
  }

  /**
   * Check if running on Android 12+ (S) where breakdown permissions are needed
   */
  private isAndroid12OrHigher(): boolean {
    return Platform.OS === 'android' && Platform.Version >= 31;
  }

  /**
   * Check if Bluetooth Radio is Powered On
   */
  public async checkBluetoothState(): Promise<boolean> {
    // Simulator Bypass
    if (!Device.isDevice) return true;

    const manager = getBleManager();
    if (!manager) return false;

    try {
      const state = await manager.state();
      return state === 'PoweredOn';
    } catch {
      return false;
    }
  }

  /**
   * Check Bluetooth Permission Status
   */
  /* eslint-disable max-lines-per-function */
  public async checkBluetoothStatus(): Promise<PermissionStatus> {
    // Simulator Bypass
    if (!Device.isDevice) {
      return 'granted';
    }

    if (Platform.OS === 'ios') {
      // iOS: BLE Manager instantiation triggers the permission popup.
      // We must check if we have requested it before to avoid premature popups.
      const hasRequested = storage.getString(HAS_REQUESTED_BLE);
      if (!hasRequested) return 'undetermined';

      // If requested previously, it's safe to instantiate manager to check real status
      const manager = getBleManager();
      if (!manager) return 'undetermined';

      try {
        let state = await manager.state();

        // If state is Unknown, wait for it to settle (max 2s)
        if (state === 'Unknown') {
          await new Promise<void>((resolve) => {
            const subscription = manager.onStateChange((newState) => {
              if (newState !== 'Unknown') {
                subscription.remove();
                state = newState;
                resolve();
              }
            }, true);

            // Safety timeout
            setTimeout(() => {
              subscription.remove();
              resolve();
            }, 2000);
          });
        }

        // Unauthorized means user explicitly denied or restricted
        if (state === 'Unauthorized') {
          storage.set(BLE_DENIED_IOS, true);
          return 'blocked';
        }

        storage.delete(BLE_DENIED_IOS);

        // If not Unauthorized, the PERMISSION is granted (even if Unknown, PoweredOff, Resetting, etc.)
        // We return 'granted' so the permission check passes.
        // The app layout will separately check isBluetoothEnabled to enforce Radio On.
        return 'granted';
      } catch {
        return 'undetermined';
      }
    } else {
      // Android
      if (this.isAndroid12OrHigher()) {
        const scan = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        const connect = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        return scan && connect ? 'granted' : 'undetermined';
      } else {
        // Android < 12 uses basic Location for BLE
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted ? 'granted' : 'undetermined';
      }
    }
  }

  /**
   * Request Bluetooth Permissions
   */
  public async requestBluetoothPermission(): Promise<boolean> {
    // Simulator Bypass
    if (!Device.isDevice) {
      return true;
    }

    if (Platform.OS === 'ios') {
      return this.requestBluetoothPermissionIOS();
    }

    if (Platform.OS === 'android') {
      if (this.isAndroid12OrHigher()) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        const scanGranted =
          result['android.permission.BLUETOOTH_SCAN'] === 'granted';
        const connectGranted =
          result['android.permission.BLUETOOTH_CONNECT'] === 'granted';

        return scanGranted && connectGranted;
      } else {
        // Android < 12 requires Location
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      }
    }

    return false;
  }

  /**
   * Internal iOS Bluetooth Request Logic
   */
  private async requestBluetoothPermissionIOS(): Promise<boolean> {
    // Mark as requested before instantiating
    storage.set(HAS_REQUESTED_BLE, true);

    // iOS requests permission automatically when instantiating BLE Manager or scanning
    const manager = getBleManager();
    if (!manager) return false;

    try {
      let state = await manager.state();

      // On iOS, if it's the first time, state stays 'Unknown' until user interacts with the dialog.
      // We wait for a state change away from 'Unknown'.
      if (state === 'Unknown') {
        await new Promise<void>((resolve) => {
          const subscription = manager.onStateChange((newState) => {
            if (newState !== 'Unknown') {
              subscription.remove();
              state = newState;
              resolve();
            }
          }, true);

          // Safety timeout (30 seconds) in case something goes wrong
          setTimeout(() => {
            subscription.remove();
            resolve();
          }, 30000);
        });
      }

      const granted = state !== 'Unauthorized';

      // Store denied state if permission was not granted
      if (!granted) {
        storage.set(BLE_DENIED_IOS, true);
      } else {
        storage.delete(BLE_DENIED_IOS);
      }

      return granted;
    } catch (err) {
      console.warn('Bluetooth request error:', err);
      return false;
    }
  }

  /**
   * Check Location Permission Status
   *
   * NOTE: On iOS, expo-location cannot distinguish between "Allow Once" and
   * "Allow While Using App" - both return status 'granted' with scope 'whenInUse'.
   * This is a platform limitation. "Allow Once" will show as granted but expires
   * when the app closes.
   */
  public async checkLocationStatus(): Promise<PermissionStatus> {
    // Simulator Bypass
    if (!Device.isDevice) {
      return 'granted';
    }

    // Use expo-location for cross-platform check (handles iOS and Android)
    try {
      const result = await Location.getForegroundPermissionsAsync();

      // Both "Allow Once" and "Allow While Using App" return granted status
      // We accept both since they do provide location access (even if temporary)
      if (result.status === 'granted') {
        return 'granted';
      }

      // Check if we can ask again (determines if blocked or just denied)
      if (result.canAskAgain === false) {
        return 'blocked';
      }

      // Status is denied or undetermined
      return result.status === 'undetermined' ? 'undetermined' : 'denied';
    } catch {
      return 'undetermined';
    }
  }

  /**
   * Request Location Permission
   */
  public async requestLocationPermission(): Promise<boolean> {
    // Simulator Bypass
    if (!Device.isDevice) {
      return true;
    }

    try {
      // Use expo-location to force the native popup on iOS and Android
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  /**
   * Check if all required permissions are granted
   */
  public async areAllPermissionsGranted(): Promise<boolean> {
    // Simulator Bypass
    if (!Device.isDevice) {
      return true;
    }

    const ble = await this.checkBluetoothStatus();
    const loc = await this.checkLocationStatus();

    // Require BOTH for both platforms now (per user request)
    return ble === 'granted' && loc === 'granted';
  }
}

export const blePermissions = BlePermissions.getInstance();
export default BlePermissions;
