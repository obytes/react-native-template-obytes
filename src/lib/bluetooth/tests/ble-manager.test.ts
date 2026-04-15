// Initial global mock
jest.mock('expo-device', () => ({
  isDevice: true,
}));

const mockManager = {
  state: jest.fn().mockResolvedValue('PoweredOn'),
  onStateChange: jest.fn().mockReturnValue({ remove: jest.fn() }),
  destroy: jest.fn(),
  setLogLevel: jest.fn(),
};

jest.mock('react-native-ble-plx', () => {
  return {
    BleManager: jest.fn(() => mockManager),
    LogLevel: { Debug: 2 },
    State: { PoweredOn: 'PoweredOn' },
  };
});

describe('BleManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  afterEach(() => {
    jest.useRealTimers();
  });

  const getIsolatedModule = (isDevice: boolean) => {
    let mod: any;
    jest.isolateModules(() => {
      jest.doMock('expo-device', () => ({ __esModule: true, isDevice }));
      mod = require('../ble-manager');
    });
    return mod;
  };

  it('provides a singleton instance', () => {
    const mod = getIsolatedModule(true);
    const manager1 = mod.getBleManager();
    const manager2 = mod.getBleManager();
    expect(manager1).toBe(manager2);
    expect(manager1).not.toBeNull();
  });

  it('checks if BLE is powered on', async () => {
    const mod = getIsolatedModule(true);
    const singleton = mod.default.getInstance();
    singleton.getManager();
    const isEnabled = await singleton.isBluetoothEnabled();
    expect(isEnabled).toBe(true);
  });

  it('destroys manager', () => {
    const mod = getIsolatedModule(true);
    const singleton = mod.default.getInstance();
    singleton.getManager();
    singleton.destroy();
    expect(mockManager.destroy).toHaveBeenCalled();
  });

  it('waits for powered on state', async () => {
    jest.useFakeTimers();
    const mod = getIsolatedModule(true);
    const singleton = mod.default.getInstance();
    singleton.getManager();
    let stateCallback: any;
    mockManager.onStateChange.mockImplementation((cb: any) => {
      stateCallback = cb;
      return { remove: jest.fn() };
    });
    const waitPromise = singleton.waitForPoweredOn(5000);
    stateCallback('PoweredOn');
    await expect(waitPromise).resolves.toBeUndefined();
  });

  it('initializes even on simulator', () => {
    const mod = getIsolatedModule(false);
    const manager = mod.getBleManager();
    expect(manager).not.toBeNull();
  });
});
