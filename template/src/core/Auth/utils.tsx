import {MMKV} from 'react-native-mmkv';

const TOKEN = 'token';
const storage = new MMKV();

export type TokenType = {
  access: string;
  refresh: string;
};

export function getItem<T>(key: string): T {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}
export async function removeItem(key: string) {
  storage.delete(key);
}

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);
