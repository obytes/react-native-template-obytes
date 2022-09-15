import { locale } from 'expo-localization';
import type TranslateOptions from 'i18next';
import i18n from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { initReactI18next } from 'react-i18next';
import ReactNative, { NativeModules } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import ar from '@/translations/ar.json';
import en from '@/translations/en.json';

import type { Language } from './utils';
import { getLanguage, LOCAL } from './utils';

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage() || locale,
  fallbackLng: 'en',
  compatibilityJSON: 'v3', // By default React Native projects does not support Intl

  // allows integrating dynamic values into translations.
  interpolation: {
    escapeValue: false, // escape passed in values to avoid XSS injections
  },
});

// Is it a RTL language?
export const isRTL: boolean = i18n.dir() === 'rtl';
// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);
ReactNative.I18nManager.forceRTL(isRTL);

export const translate = memoize(
  (key: string, options = undefined) => i18n.t(key, options),
  (key: string, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key
);

export const changeLanguage = (lang: Language) => {
  i18n.changeLanguage(lang);
  if (lang === 'ar') {
    ReactNative.I18nManager.forceRTL(true);
  }
  NativeModules.DevSettings.reload();
};

export const useSelectedLanguage = () => {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang);
      if (lang !== undefined) changeLanguage(lang as Language);
    },
    [setLang]
  );

  return { language: language as Language, setLanguage };
};

export const getLocale: () => string = () => i18n.language;
export default i18n;
