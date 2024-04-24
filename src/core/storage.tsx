import { MMKV } from 'react-native-mmkv';

export const storage = typeof window !== 'undefined' ? new MMKV() : undefined;

export function getItem<T>(key: string): T | null {
  if (storage) {
    const value = storage.getString(key);
    return value ? JSON.parse(value) || null : null;
  }
  return null;
}

export async function setItem<T>(key: string, value: T) {
  if (storage) {
    storage.set(key, JSON.stringify(value));
  }
}

export async function removeItem(key: string) {
  if (storage) {
    storage.delete(key);
  }
}
