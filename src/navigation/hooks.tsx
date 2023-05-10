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
      background: colors.charcoal[950],
      text: colors.charcoal[100],
      border: colors.charcoal[500],
      card: colors.charcoal[900],
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
