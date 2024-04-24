import { MMKV } from 'react-native-mmkv';

export const webStorage =
  typeof window !== 'undefined' ? new MMKV() : undefined;

export function getItem<T>(key: string): T | null {
  if (webStorage) {
    const value = webStorage.getString(key);
    return value ? JSON.parse(value) : null;
  }
  return null;
}

export async function setItem<T>(key: string, value: T) {
  if (webStorage) {
    webStorage.set(key, JSON.stringify(value));
  }
}

export async function removeItem(key: string) {
  if (webStorage) {
    webStorage.delete(key);
  }
}
