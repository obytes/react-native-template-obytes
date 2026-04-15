/**
 * BLE Scanner
 * Handles device scanning with Ziva ring name filtering
 */

import { type Device, ScanMode } from 'react-native-ble-plx';

import BleManagerSingleton, { getBleManager } from './ble-manager';

// Regex pattern for Ziva ring device names
export const ZIVA_RING_NAMES_REGEX = /^2301B|ZR100|X1B/;

export interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  device: Device;
}

export interface ScanOptions {
  timeout?: number;
  allowDuplicates?: boolean;
  onDeviceFound?: (device: ScannedDevice) => void;
  filterZivaOnly?: boolean;
}

class BleScanner {
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, ScannedDevice> = new Map();
  private scanResolve: ((devices: ScannedDevice[]) => void) | null = null;
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Start scanning for BLE devices
   */
  public async startScan(options: ScanOptions = {}): Promise<ScannedDevice[]> {
    const {
      timeout = 10000,
      allowDuplicates = false,
      onDeviceFound,
      filterZivaOnly = true,
    } = options;


    if (this.isScanning) {
      console.log('[BLE Scanner] Already scanning, stopping previous scan...');
      this.stopScan();
    }

    this.discoveredDevices.clear();
    this.isScanning = true;

    return new Promise((resolve, reject) => {
      this.scanResolve = resolve;
      console.log('[BLE Scanner] Starting scan...');

      // Wait for Bluetooth to be fully powered on before scanning.
      // The BleManager starts in 'Unknown' state momentarily — scanning
      // during that window produces an immediate BleError.
      BleManagerSingleton.getInstance()
        .waitForPoweredOn(5000)
        .then(() => {
          const mgr = getBleManager();
          if (!mgr) {
            reject(new Error('BLE Manager not available after power-on'));
            return;
          }

          mgr.startDeviceScan(
            null,
            { scanMode: ScanMode.LowLatency, allowDuplicates },
            (error, device) => {
              if (error) {
                console.error('[BLE Scanner] Scan error:', error);
                this.stopScan();
                reject(error);
                return;
              }
              if (device) {
                this.handleScannedDevice(device, filterZivaOnly, onDeviceFound);
              }
            }
          );

          // Set timeout to stop scanning
          this.scanTimeout = setTimeout(() => {
            this.stopScan();
          }, timeout);
        })
        .catch((err) => {
          this.isScanning = false;
          this.scanResolve = null;
          reject(err);
        });
    });
  }

  /**
   * Stop ongoing scan
   */
  public stopScan(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.isScanning) {
      const manager = getBleManager();
      manager?.stopDeviceScan();
      this.isScanning = false;
      console.log('[BLE Scanner] Scan stopped');
    }

    // Resolve the promise if it exists
    if (this.scanResolve) {
      this.scanResolve(Array.from(this.discoveredDevices.values()));
      this.scanResolve = null;
    }
  }

  /**
   * Get currently discovered devices
   */
  public getDiscoveredDevices(): ScannedDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  /**
   * Internal handler for scanned devices
   */
  private handleScannedDevice(
    device: Device,
    filterZivaOnly: boolean,
    onDeviceFound?: (device: ScannedDevice) => void
  ) {
    // Apply Ziva ring filter if enabled
    if (filterZivaOnly) {
      const deviceName = device.name || device.localName || '';
      if (!ZIVA_RING_NAMES_REGEX.test(deviceName)) {
        return; // Skip non-Ziva devices
      }
    }

    const scannedDevice: ScannedDevice = {
      id: device.id,
      name: device.name || device.localName,
      rssi: device.rssi,
      device,
    };

    // Deduplicate
    if (!this.discoveredDevices.has(device.id)) {
      this.discoveredDevices.set(device.id, scannedDevice);
      console.log(
        `[BLE Scanner] Found device: ${scannedDevice.name} (${device.id})`
      );

      if (onDeviceFound) {
        onDeviceFound(scannedDevice);
      }
    }
  }

  /**
   * Check if currently scanning
   */
  public isScanningActive(): boolean {
    return this.isScanning;
  }
}

// Export singleton instance
export const bleScanner = new BleScanner();
export default BleScanner;
