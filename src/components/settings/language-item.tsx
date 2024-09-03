import { useCallback, useMemo } from 'react';

import { useSelectedLanguage } from '@/core';
import { translate } from '@/core';
import type { Language } from '@/core/i18n/resources';
import type { Option } from '@/ui';
import { Options, useModal } from '@/ui';

import { Item } from './item';

export const LanguageItem = () => {
  const { language, setLanguage } = useSelectedLanguage();
  const modal = useModal();
  const onSelect = useCallback(
    (option: Option) => {
      setLanguage(option.value as Language);
      modal.dismiss();
    },
    [setLanguage, modal]
  );

  const langs = useMemo(
    () => [
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
    ],
    []
  );

  const selectedLanguage = useMemo(
    () => langs.find((lang) => lang.value === language),
    [language, langs]
  );

  return (
    <>
      <Item
        text="settings.language"
        value={selectedLanguage?.label}
        onPress={modal.present}
      />
      <Options
        ref={modal.ref}
        options={langs}
        onSelect={onSelect}
        value={selectedLanguage?.value}
      />
    </>
  );
};
