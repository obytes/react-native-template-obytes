import SInfo from 'react-native-sensitive-info';

const TOKEN = 'token';
const SHARED_PERFS = 'ObytesSharedPerfs';
const KEYCHAIN_SERVICE = 'ObytesKeychain';
const keyChainOptions = {
  sharedPreferencesName: SHARED_PERFS,
  keychainService: KEYCHAIN_SERVICE,
};

export async function getItem<T>(key: string): Promise<T | null> {
  const value = await SInfo.getItem(key, keyChainOptions);
  return value ? JSON.parse(value)?.[key] || null : null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  SInfo.setItem(key, JSON.stringify({[key]: value}), keyChainOptions);
}
export async function removeItem(key: string): Promise<void> {
  SInfo.deleteItem(key, keyChainOptions);
}

export const getToken = () => getItem<string>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: string) => setItem<string>(TOKEN, value);
