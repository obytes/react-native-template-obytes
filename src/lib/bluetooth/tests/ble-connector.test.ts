/* eslint-disable max-lines-per-function */
import { act } from '@testing-library/react-native';

// Mock ble-manager
jest.mock('../ble-manager', () => ({
  getBleManager: jest.fn(),
  isPhysicalDevice: true,
}));

describe('BleConnector', () => {
  let mockBleManager: any;
  let mockDevice: any;
  let connector: any;
  let bleManagerModule: any;

  beforeEach(() => {
    jest.clearAllMocks();
    bleManagerModule = require('../ble-manager');



    mockDevice = {
      id: '123',
      name: 'ZR100',
      discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue({}),
      requestMTU: jest.fn().mockResolvedValue({ mtu: 512 }),
      cancelConnection: jest.fn().mockResolvedValue({}),
    };

    mockBleManager = {
      connectToDevice: jest.fn().mockResolvedValue(mockDevice),
      isDeviceConnected: jest.fn().mockResolvedValue(true),
      onDeviceDisconnected: jest.fn().mockReturnValue({ remove: jest.fn() }),
    };

    (bleManagerModule.getBleManager as jest.Mock).mockReturnValue(
      mockBleManager
    );
    bleManagerModule.isPhysicalDevice = true;

    // Use isolateModules for every test to avoid state leaks
    jest.isolateModules(() => {
      connector = require('../ble-connector').bleConnector;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('successfully connects to a device', async () => {
    const result = await connector.connect('123');
    expect(result.device).toBe(mockDevice);
    expect(mockBleManager.connectToDevice).toHaveBeenCalled();
  });

  it('retries on failure', async () => {
    mockBleManager.connectToDevice
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValueOnce(mockDevice);

    jest.useFakeTimers();

    // Use smaller timeout for test
    const connectPromise = connector.connect('123', {
      retryCount: 2,
      timeout: 1000,
    });

    // Need to advance timers multiple times because of the retry loop delays
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // yield to microtasks
      });
    }

    const result = await connectPromise;
    expect(mockBleManager.connectToDevice).toHaveBeenCalledTimes(2);
    expect(result.device).toBe(mockDevice);
  });

  it('handles MTU negotiation failure', async () => {
    mockDevice.requestMTU.mockRejectedValue(new Error('MTU fail'));
    const result = await connector.connect('123');
    expect(result.mtu).toBe(23);
  });

  it('checks connection status', async () => {
    const status = await connector.isConnected('123');
    expect(mockBleManager.isDeviceConnected).toHaveBeenCalledWith('123');
    expect(status).toBe(true);
  });

  it('subscribes to disconnection', () => {
    const callback = jest.fn();
    const unsubscribe = connector.onDisconnected('123', callback);
    expect(mockBleManager.onDeviceDisconnected).toHaveBeenCalled();
    const handler = mockBleManager.onDeviceDisconnected.mock.calls[0][1];
    handler(null, { id: '123' });
    expect(callback).toHaveBeenCalled();
    unsubscribe();
  });

  it('throws error on simulator', async () => {
    // Re-mock ble-manager for this specific test
    jest.resetModules();
    jest.doMock('../ble-manager', () => ({
      __esModule: true,
      getBleManager: jest.fn(),
      isPhysicalDevice: false,
    }));
    const isolatedConnector = require('../ble-connector').bleConnector;
    await expect(isolatedConnector.connect('123')).rejects.toThrow('available');
  });
});
