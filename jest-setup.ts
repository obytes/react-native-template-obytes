/* eslint-disable ts/ban-ts-comment */
/* eslint-disable no-restricted-globals */

// Mock react-native-worklets first
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  return {
    __esModule: true,
    default: {
      View,
      ScrollView: View,
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(fn => fn()),
    withTiming: jest.fn(value => value),
    withSpring: jest.fn(value => value),
    withDecay: jest.fn(value => value),
    withDelay: jest.fn((_, value) => value),
    withRepeat: jest.fn(value => value),
    withSequence: jest.fn((...values) => values[0]),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(fn => fn),
      out: jest.fn(fn => fn),
      inOut: jest.fn(fn => fn),
    },
    FadeIn: { duration: jest.fn(() => ({})) },
    FadeOut: { duration: jest.fn(() => ({})) },
    FadeInDown: { duration: jest.fn(() => ({})) },
    FadeInUp: { duration: jest.fn(() => ({})) },
    FadeInLeft: { duration: jest.fn(() => ({})) },
    FadeInRight: { duration: jest.fn(() => ({})) },
    SlideInDown: { duration: jest.fn(() => ({})) },
    SlideInUp: { duration: jest.fn(() => ({})) },
    SlideInLeft: { duration: jest.fn(() => ({})) },
    SlideInRight: { duration: jest.fn(() => ({})) },
    Layout: {},
    Keyframe: jest.fn(),
  };
});

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [
    {
      languageTag: 'en-US',
      languageCode: 'en',
      textDirection: 'ltr',
      digitGroupingSeparator: ',',
      decimalSeparator: '.',
      measurementSystem: 'metric',
      currencyCode: 'USD',
      currencySymbol: '$',
      regionCode: 'US',
    },
  ]),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
  useMMKVString: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVNumber: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVBoolean: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVObject: jest.fn((_key: string) => [undefined, jest.fn()]),
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock react-native-keyboard-controller
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardProvider: ({ children }: any) => children,
  useKeyboardHandler: jest.fn(),
  useKeyboardController: jest.fn(() => ({
    keyboard: { value: { height: 0 } },
    isKeyboardOpening: { value: false },
    isKeyboardClosing: { value: false },
  })),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  ScreenContainer: ({ children }: any) => children,
  Screen: ({ children }: any) => children,
  NativeScreen: ({ children }: any) => children,
  NativeScreenContainer: ({ children }: any) => children,
  ScreenStack: ({ children }: any) => children,
  ScreenStackHeaderConfig: ({ children }: any) => children,
  ScreenStackHeaderLeftView: ({ children }: any) => children,
  ScreenStackHeaderCenterView: ({ children }: any) => children,
  ScreenStackHeaderRightView: ({ children }: any) => children,
  ScreenStackHeaderSubview: ({ children }: any) => children,
  SearchBar: ({ children }: any) => children,
}));

// Mock NavigationContainer to avoid timers/leaks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }: any) => children,
  };
});

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => {


  return {
    BleManager: jest.fn(),
    LogLevel: { None: 0, Critical: 1, Error: 2, Warning: 3, Info: 4, Debug: 5, Verbose: 6 },
    State: { Unknown: 'Unknown', Resetting: 'Resetting', Unsupported: 'Unsupported', Unauthorized: 'Unauthorized', PoweredOff: 'PoweredOff', PoweredOn: 'PoweredOn' },
    ScanMode: { LowPower: 0, Balanced: 1, LowLatency: 2, Opportunistic: -1 },
  };
});

// Mock NativeModules to avoid Invariant Violation
const { NativeModules } = require('react-native');

// Define the mocks we need
const requiredMocks = {
  NativeSoundManager: {
    playTouchSound: jest.fn(),
  },
  PlatformConstants: {
    forceTouchAvailable: false,
    interfaceStyle: 'light',
  },
  NativePlatformConstantsIOS: {
    forceTouchAvailable: false,
    interfaceStyle: 'light',
    is64Bit: true,
  },
  NativePlatformConstantsAndroid: {
    Version: 30,
    Release: '11',
    Serial: 'unknown',
    Fingerprint: 'unknown',
    Model: 'unknown',
    Brand: 'unknown',
    Manufacturer: 'unknown',
    ServerId: 'unknown',
  },
  RNCNetInfo: {
    getCurrentState: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  TimonModule: {
    initTimon: jest.fn(),
    initBucket: jest.fn(),
    createDatabase: jest.fn(),
    createTable: jest.fn(),
    listDatabases: jest.fn(),
    listTables: jest.fn(),
    deleteDatabase: jest.fn(),
    deleteTable: jest.fn(),
    query: jest.fn(),
    insert: jest.fn(),
    cloudSinkParquet: jest.fn(),
    cloudFetchParquet: jest.fn(),
    cloudFetchParquetBatch: jest.fn(),
    cloudSyncParquet: jest.fn(),
    queryBucket: jest.fn(),
    getSyncMetadata: jest.fn(),
    getAllSyncMetadata: jest.fn(),
    nativePreloadTables: jest.fn(),
  },


  SourceCode: {
    scriptURL: 'http://localhost:8081/index.bundle?platform=ios&dev=true',
  },
  NativeSourceCode: {
    getConstants: () => ({
      scriptURL: 'http://localhost:8081/index.bundle?platform=ios&dev=true',
    }),
  },
};

// Safely apply mocks to NativeModules without destroying existing getters
Object.keys(requiredMocks).forEach((key) => {
  if (!NativeModules[key]) {
    Object.defineProperty(NativeModules, key, {
      get: () => requiredMocks[key as keyof typeof requiredMocks],
      configurable: true,
    });
  }
});


// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  Paths: {
    document: {
      uri: 'file:///mock/document/path/',
    },
  },
}));

// Global window object setup for React Native testing
// @ts-expect-error
global.window = {};

// @ts-expect-error
global.window = global;

// Global cleanup
afterEach(() => {
  if (jest.isMockFunction(setTimeout)) {
    jest.clearAllTimers();
  }
});

// Mock react-native-nitro-sqlite
jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn().mockReturnValue({
    executeAsync: jest.fn().mockResolvedValue({ rows: { _array: [] } }),
    close: jest.fn(),
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

