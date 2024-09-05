import { Linking } from 'react-native';
import type { StoreApi, UseBoundStore } from 'zustand';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <
  T extends object,
  S extends UseBoundStore<StoreApi<T>>
>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as { [K in keyof T]: () => T[K] };

  for (const k of Object.keys(store.getState()) as Array<keyof T>) {
    store.use[k] = () => store((s) => s[k]);
  }

  return store;
};
