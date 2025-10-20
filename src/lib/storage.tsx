import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  if (value === undefined) {
    return null;
  }

  try {
    return (JSON.parse(value) as T) ?? null;
  } catch (error) {
    console.warn(`Failed to parse storage value for key "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.remove(key);
}
