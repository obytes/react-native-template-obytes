import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export function getItem<T>(key: string): T | null {
  try {
    const value = storage.getString(key);
    if (!value)
      return null;
    return JSON.parse(value) ?? null;
  }
  catch (e) {
    console.error(`Failed to get item "${key}":`, e);
    return null;
  }
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.remove(key);
}
