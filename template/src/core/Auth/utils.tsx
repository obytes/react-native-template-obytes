import {MMKV} from 'react-native-mmkv';

const TOKEN = 'token';
export type TokenType = {
  access: string;
  refresh: string;
};

export function getItem<T>(key: string): TokenType {
  const value = MMKV.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  MMKV.set(key, JSON.stringify(value));
}
export async function removeItem(key: string) {
  MMKV.delete(key);
}

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);
