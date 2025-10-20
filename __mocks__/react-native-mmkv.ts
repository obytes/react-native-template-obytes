// Mock for react-native-mmkv
export const createMMKV = () => ({
  set: jest.fn(),
  getString: jest.fn(),
  getNumber: jest.fn(),
  getBoolean: jest.fn(),
  delete: jest.fn(),
  clearAll: jest.fn(),
  getAllKeys: jest.fn(() => []),
  contains: jest.fn(() => false),
});

export const useMMKVString = jest.fn(() => ['', jest.fn()]);
export const useMMKVNumber = jest.fn(() => [0, jest.fn()]);
export const useMMKVBoolean = jest.fn(() => [false, jest.fn()]);
export const useMMKVObject = jest.fn(() => [null, jest.fn()]);
