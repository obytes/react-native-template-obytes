import { getItem, removeItem, setItem } from '@/core/utils';

const TOKEN = 'Onboarding';

export const getToken = () => getItem<string>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: string) => setItem<string>(TOKEN, value);
