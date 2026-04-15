/**
 * usePermissions
 * Checks and requests Bluetooth + Location permissions.
 * Ported from zivaone_app/src/features/ring/hooks/use-permissions.ts
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { blePermissions, type PermissionStatus } from '../ble-permissions';
import BleManagerSingleton from '../ble-manager';

// eslint-disable-next-line max-lines-per-function
export function usePermissions({
  enabled = true,
  autoRequest = false,
}: {
  enabled?: boolean;
  autoRequest?: boolean;
} = {}) {
  const [bleStatus, setBleStatus] = useState<PermissionStatus>('undetermined');
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('undetermined');
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasAutoRequested = useRef(false);

  const checkPermissions = useCallback(async () => {
    if (!enabled) return;

    try {
      const ble = await blePermissions.checkBluetoothStatus();
      const loc = await blePermissions.checkLocationStatus();
      const bleEnabled = await blePermissions.checkBluetoothState();

      setBleStatus(ble);
      setLocationStatus(loc);
      setIsBluetoothEnabled(bleEnabled);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Listen to BLE state changes (Radio On/Off)
  useEffect(() => {
    if (!enabled) return;

    const manager = BleManagerSingleton.getInstance().getManager();
    const subscription = manager.onStateChange((state) => {
      setIsBluetoothEnabled(state === 'PoweredOn');
      checkPermissions();
    }, true);

    return () => subscription.remove();
  }, [enabled, checkPermissions]);

  // Re-check on app foreground in case user changed Settings
  useEffect(() => {
    if (enabled) {
      checkPermissions();
    }

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && enabled) {
        setTimeout(() => {
          checkPermissions();
        }, 500);
      }
    });
    return () => sub.remove();
  }, [checkPermissions, enabled]);

  // Auto-request Bluetooth on mount
  useEffect(() => {
    if (!autoRequest || hasAutoRequested.current || !enabled || loading) return;

    if (bleStatus === 'undetermined') {
      blePermissions.requestBluetoothPermission().then(() => {
        checkPermissions();
      });
    }
  }, [autoRequest, enabled, loading, bleStatus, checkPermissions]);

  // Auto-request Location ONLY after Bluetooth is settled
  useEffect(() => {
    if (!autoRequest || hasAutoRequested.current || !enabled || loading) return;

    if (bleStatus !== 'undetermined' && locationStatus === 'undetermined') {
      hasAutoRequested.current = true;
      blePermissions.requestLocationPermission().then(() => {
        checkPermissions();
      });
    }
  }, [autoRequest, enabled, loading, bleStatus, locationStatus, checkPermissions]);

  const requestBle = async () => {
    await blePermissions.requestBluetoothPermission();
    await checkPermissions();
  };

  const requestLocation = async () => {
    await blePermissions.requestLocationPermission();
    await checkPermissions();
  };

  const isAllGranted = bleStatus === 'granted' && locationStatus === 'granted';

  return {
    bleStatus,
    locationStatus,
    isBluetoothEnabled,
    loading,
    requestBle,
    requestLocation,
    checkPermissions,
    isAllGranted,
  };
}
