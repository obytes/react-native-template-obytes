import type TranslateOptions from 'i18next';
import i18n from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import RNRestart from 'react-native-restart';

import { storage } from '../storage';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = (): Language | undefined => {
  return storage.getString(LOCAL) as Language | undefined;
};

export const translate = memoize(
  (key: TxKeyPath, options = undefined) =>
    i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key
) as unknown as {
  (key: TxKeyPath, options?: typeof TranslateOptions): string;
  cache: {
    clear(): void;
  };
};

export const changeLanguage = async (lang: Language) => {
  try {
    await i18n.changeLanguage(lang);

    if (lang === 'ar') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }

    translate.cache.clear();

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      RNRestart.restart();
    } else if (Platform.OS === 'web') {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export const useSelectedLanguage = () => {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    async (lang: Language) => {
      try {
        setLang(lang);
        if (lang) {
          await changeLanguage(lang);
        }
      } catch (error) {
        console.error('Error setting language:', error);
      }
    },
    [setLang]
  );

  return { language: language as Language, setLanguage };
};

i18n.on('languageChanged', () => {
  console.log('Language changed successfully');
});

i18n.on('missingKey', (lng, ns, key) => {
  console.error(`Missing translation key: ${key} in language: ${lng}`);
});
