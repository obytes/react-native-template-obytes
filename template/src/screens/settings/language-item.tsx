import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { useSelectedLanguage } from '@/core';
import { translate } from '@/core';
import type { Language } from '@/core/i18n/types';
import type { Option } from '@/ui';
import { Options } from '@/ui';

import { Item } from './item';

export const LanguageItem = () => {
  const { language, setLanguage } = useSelectedLanguage();
  const optionsRef = React.useRef<BottomSheetModal>(null);
  const open = React.useCallback(() => optionsRef.current?.present(), []);
  const onSelect = React.useCallback(
    (option: Option) => {
      setLanguage(option.value as Language);
      optionsRef.current?.dismiss();
    },
    [setLanguage]
  );

  const langs = React.useMemo(
    () => [
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
    ],
    []
  );

  const selectedLanguage = React.useMemo(
    () => langs.find((lang) => lang.value === language),
    [language, langs]
  );

  return (
    <>
      <Item
        text="settings.language"
        value={selectedLanguage?.label}
        onPress={open}
      />
      <Options
        ref={optionsRef}
        options={langs}
        onSelect={onSelect}
        value={selectedLanguage}
      />
    </>
  );
};
