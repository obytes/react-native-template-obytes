import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

const isExpoGo = Constants.appOwnership === 'expo';

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

function createStorage(): StorageLike {
  if (isExpoGo) {
    const cache = new Map<string, string>();
    let initPromise: Promise<void> | null = null;
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    async function loadCache() {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const pairs = await AsyncStorage.multiGet(keys);
        for (const [k, v] of pairs) {
          if (v != null)
            cache.set(k, v);
        }
      }
      catch {
        // ignore
      }
    }

    const storage: StorageLike & { init?: () => Promise<void> } = {
      getString(key: string) {
        return cache.get(key);
      },
      set(key: string, value: string) {
        cache.set(key, value);
        void AsyncStorage.setItem(key, value);
      },
      remove(key: string) {
        cache.delete(key);
        void AsyncStorage.removeItem(key);
      },
      init() {
        if (!initPromise)
          initPromise = loadCache();
        return initPromise;
      },
    };
    return storage;
  }
  const { createMMKV } = require('react-native-mmkv');
  return createMMKV();
}

const storage = createStorage();

export { storage };

export async function initStorage() {
  const s = storage as StorageLike & { init?: () => Promise<void> };
  if (typeof s.init === 'function')
    await s.init();
}

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.remove(key);
}

// Hooks: same order every time (useState + useCallback) so Rules of Hooks are satisfied.
export function useStorageString(key: string): [string | undefined, (value: string | undefined) => void] {
  const [val, setVal] = useState<string | undefined>(() => storage.getString(key));
  const set = useCallback(
    (v: string | undefined) => {
      if (v !== undefined)
        storage.set(key, v);
      else
        storage.remove(key);
      setVal(v);
    },
    [key],
  );
  return [val, set];
}

export function useStorageBoolean(key: string): [boolean | undefined, (value: boolean | undefined) => void] {
  const raw = storage.getString(key);
  const parsed = raw === undefined ? undefined : raw === 'true';
  const [val, setVal] = useState<boolean | undefined>(() => parsed);
  const set = useCallback(
    (v: boolean | undefined) => {
      if (v !== undefined)
        storage.set(key, String(v));
      else
        storage.remove(key);
      setVal(v);
    },
    [key],
  );
  return [val, set];
}
