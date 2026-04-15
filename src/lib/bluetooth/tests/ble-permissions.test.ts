import * as Location from 'expo-location';
/* eslint-disable max-lines-per-function */
import { PermissionsAndroid, Platform } from 'react-native';

import { storage } from '@/lib/storage';

import { getBleManager } from '../ble-manager';

// Variables to control mocks
let mockIsDevice = true;

// Simplified react-native mock
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: 30,
    select: (objs: any) => objs.ios || objs.default,
  },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    requestMultiple: jest.fn(),
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
}));

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../ble-manager', () => ({
  getBleManager: jest.fn(),
}));

describe('BlePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDevice = true;
  });

  const getModule = (
    os: 'ios' | 'android' | 'web' = 'ios',
    version: number = 0
  ) => {
    (Platform as any).OS = os;
    (Platform as any).Version = version;

    let module: any;
    jest.isolateModules(() => {
      module = require('../ble-permissions');
    });
    return module.blePermissions;
  };

  describe('checkBluetoothStatus', () => {
    it('returns granted on simulator', async () => {
      mockIsDevice = false;
      const blePermissions = getModule('ios');
      const status = await blePermissions.checkBluetoothStatus();
      expect(status).toBe('granted');
    });

    it('returns status on iOS', async () => {
      (storage.getString as jest.Mock).mockReturnValue('true');
      const mockManager = { state: jest.fn().mockResolvedValue('PoweredOn') };
      (getBleManager as jest.Mock).mockReturnValue(mockManager);

      const blePermissions = getModule('ios');
      expect(await blePermissions.checkBluetoothStatus()).toBe('granted');

      mockManager.state.mockResolvedValue('Unauthorized');
      expect(await blePermissions.checkBluetoothStatus()).toBe('blocked');
    });

    it('returns undetermined on iOS no manager', async () => {
      (storage.getString as jest.Mock).mockReturnValue('true');
      (getBleManager as jest.Mock).mockReturnValue(null);
      const blePermissions = getModule('ios');
      expect(await blePermissions.checkBluetoothStatus()).toBe('undetermined');
    });

    it('returns undetermined on iOS error', async () => {
      (storage.getString as jest.Mock).mockReturnValue('true');
      const mockManager = {
        state: jest.fn().mockRejectedValue(new Error('fail')),
      };
      (getBleManager as jest.Mock).mockReturnValue(mockManager);
      const blePermissions = getModule('ios');
      expect(await blePermissions.checkBluetoothStatus()).toBe('undetermined');
    });

    it('returns status on Android 12+', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const blePermissions = getModule('android', 31);
      const status = await blePermissions.checkBluetoothStatus();
      expect(status).toBe('granted');
      expect(PermissionsAndroid.check).toHaveBeenCalledTimes(2);
    });

    it('returns status on Android < 12', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const blePermissions = getModule('android', 29);
      const status = await blePermissions.checkBluetoothStatus();
      expect(status).toBe('granted');
      expect(PermissionsAndroid.check).toHaveBeenCalledWith(
        'android.permission.ACCESS_FINE_LOCATION'
      );
    });
  });

  describe('requestBluetoothPermission', () => {
    it('returns true on simulator', async () => {
      mockIsDevice = false;
      const blePermissions = getModule('ios');
      expect(await blePermissions.requestBluetoothPermission()).toBe(true);
    });

    it('requests on Android 12+', async () => {
      (PermissionsAndroid.requestMultiple as jest.Mock).mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN': 'granted',
        'android.permission.BLUETOOTH_CONNECT': 'granted',
      });
      const blePermissions = getModule('android', 31);
      const granted = await blePermissions.requestBluetoothPermission();
      expect(granted).toBe(true);
    });

    it('requests on Android < 12', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
      const blePermissions = getModule('android', 29);
      const granted = await blePermissions.requestBluetoothPermission();
      expect(granted).toBe(true);
    });

    it('handles iOS request', async () => {
      const mockManager = { state: jest.fn().mockResolvedValue('PoweredOn') };
      (getBleManager as jest.Mock).mockReturnValue(mockManager);
      const blePermissions = getModule('ios');
      const granted = await blePermissions.requestBluetoothPermission();
      expect(granted).toBe(true);
      expect(storage.set).toHaveBeenCalled();
    });

    it('handles iOS request no manager', async () => {
      (getBleManager as jest.Mock).mockReturnValue(null);
      const blePermissions = getModule('ios');
      const granted = await blePermissions.requestBluetoothPermission();
      expect(granted).toBe(false);
    });

    it('returns false for unknown platforms', async () => {
      const blePermissions = getModule('web' as any);
      const granted = await blePermissions.requestBluetoothPermission();
      expect(granted).toBe(false);
    });
  });

  describe('checkLocationStatus', () => {
    it('checks status via expo-location', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      const blePermissions = getModule('ios');
      expect(await blePermissions.checkLocationStatus()).toBe('granted');
    });

    it('returns granted on simulator', async () => {
      mockIsDevice = false;
      const blePermissions = getModule('ios');
      expect(await blePermissions.checkLocationStatus()).toBe('granted');
    });

    it('returns undetermined on error', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('fail')
      );
      const blePermissions = getModule('ios');
      expect(await blePermissions.checkLocationStatus()).toBe('undetermined');
    });
  });

  describe('requestLocationPermission', () => {
    it('requests via expo-location', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });
      const blePermissions = getModule('ios');
      expect(await blePermissions.requestLocationPermission()).toBe(true);
    });

    it('returns true on simulator', async () => {
      mockIsDevice = false;
      const blePermissions = getModule('ios');
      expect(await blePermissions.requestLocationPermission()).toBe(true);
    });

    it('returns false and warns on error', async () => {
      (
        Location.requestForegroundPermissionsAsync as jest.Mock
      ).mockRejectedValue(new Error('fail'));
      const blePermissions = getModule('ios');
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      expect(await blePermissions.requestLocationPermission()).toBe(false);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('areAllPermissionsGranted', () => {
    it('returns true if all granted', async () => {
      const blePermissions = getModule('ios');
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (storage.getString as jest.Mock).mockReturnValue('true');
      const mockManager = { state: jest.fn().mockResolvedValue('PoweredOn') };
      (getBleManager as jest.Mock).mockReturnValue(mockManager);

      expect(await blePermissions.areAllPermissionsGranted()).toBe(true);
    });

    it('returns true on simulator', async () => {
      mockIsDevice = false;
      const blePermissions = getModule('ios');
      expect(await blePermissions.areAllPermissionsGranted()).toBe(true);
    });
  });
});
