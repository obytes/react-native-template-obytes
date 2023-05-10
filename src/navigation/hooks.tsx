import type { Theme } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import { colors } from '@/ui';

export function useThemeConfig() {
  const { colorScheme } = useColorScheme();

  const darkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary[200],
      background: colors.night.screen,
      text: colors.night.text,
      border: colors.night.border,
      card: colors.night.screen,
    },
  };

  const lightTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary[400],
      background: colors.white,
    },
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return theme;
}
