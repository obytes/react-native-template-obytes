import { removeItem, storage } from '../utils';

export const LOCAL = 'local';
export type Language = 'en' | 'ar';

export const getLanguage = () => storage.getString(LOCAL); // 'Marc' getItem<Language | undefined>(LOCAL);
export const removeLanguage = () => removeItem(LOCAL);
export const setLanguage = (value: Language) => storage.set(LOCAL, value);
