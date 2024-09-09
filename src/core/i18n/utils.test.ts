import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../../translations/ar.json';
import en from '../../translations/en.json';
import { storage } from '../storage';
import type { TxKeyPath } from './utils';
import { changeLanguage, getLanguage, translate } from './utils';

jest.mock('../storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue('en'),
  },
}));

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  ns: ['translationsNS'],
  defaultNS: 'translationsNS',

  debug: true,

  interpolation: {
    escapeValue: false,
  },

  resources: { en: { translationsNS: en }, ar: { translationsNS: ar } },
});

describe('getLanguage', () => {
  it('should call storage.getString with LOCAL', () => {
    const lang = getLanguage();
    expect(storage.getString).toHaveBeenCalledWith('local');
    expect(lang).toBe('en');
  });
});

describe('translate', () => {
  it('should return translated string', () => {
    const key: TxKeyPath = 'onboarding.message';
    let options = { lang: 'en' };
    const translatedString = translate(key, options);
    expect(translatedString).toBe('Welcome to rootstrap app site');
    changeLanguage('ar');
    options = { lang: 'ar' };
    const translatedStringArab = translate(key, options);
    expect(translatedStringArab).toBe('مرحبا بكم في موقع تطبيق rootstrap');
  });
});
