import {I18nManager} from 'react-native';
// import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require('translations/en.json'),
  //fr: () => require('./src/translations/fr.json'),
};

export const translate = memoize(
  key => i18n.t(key),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

export const setI18nConfig = () => {
  // fallback if no available language fits
  const fallback = {languageTag: 'en', isRTL: false};

  const {languageTag, isRTL} = fallback;
  // RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
  // fallback;

  // clear translation cache
  translate?.cache?.clear?.();
  // update layout direction
  I18nManager.forceRTL(isRTL);
  // set Lang to english for now
  i18n.translations = {[languageTag]: translationGetters.en()};
  i18n.locale = languageTag;
};
