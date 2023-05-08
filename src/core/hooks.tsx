import { useColorScheme } from 'nativewind';
import React from 'react';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
const IS_FIRST_TIME = 'IS_FIRST_TIME';
export const useIsFirstTime = () => {
  const [isFirstTime, setIsFirstTime] = useMMKVBoolean(IS_FIRST_TIME);
  if (isFirstTime === undefined) {
    return [true, setIsFirstTime] as const;
  }
  return [isFirstTime, setIsFirstTime] as const;
};

const SELECTED_THEME = 'SELECTED_THEME';
export type ThemeType = 'light' | 'dark';

export const useSelectedTheme = () => {
  const { setColorScheme } = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useMMKVString(SELECTED_THEME);

  const setTheme = React.useCallback(
    (theme: ThemeType) => {
      setColorScheme(theme);
      setSelectedTheme(theme);
    },
    [setColorScheme, setSelectedTheme]
  );
  if (selectedTheme === undefined) return ['light', setTheme] as const;
  return [selectedTheme, setTheme] as const;
};
