import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import React from 'react';

import { translate } from '@/core';
import type { Option } from '@/ui';
import { Options } from '@/ui';

import { Item } from './item';

export const ThemeItem = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const optionsRef = React.useRef<BottomSheetModal>(null);
  const open = React.useCallback(() => optionsRef.current?.present(), []);
  const onSelect = React.useCallback(
    (option: Option) => {
      setColorScheme(option.value as 'light' | 'dark');
      optionsRef.current?.dismiss();
    },
    [setColorScheme]
  );

  const themes = React.useMemo(
    () => [
      { label: `${translate('settings.dark')} 🌙`, value: 'dark' },
      { label: `${translate('settings.light')} 🌞`, value: 'light' },
    ],
    []
  );

  const selectedTheme = React.useMemo(
    () => themes.find((theme) => theme.value === colorScheme),
    [colorScheme, themes]
  );

  return (
    <>
      <Item text="settings.theme" value={selectedTheme?.label} onPress={open} />
      <Options
        ref={optionsRef}
        options={themes}
        onSelect={onSelect}
        value={selectedTheme}
      />
    </>
  );
};
