import type { Theme } from 'expo-router/react-navigation';
import { DarkTheme as _DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { useUniwind } from 'uniwind';

import colors from '@/components/ui/colors';

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[200],
    background: colors.charcoal[950],
    text: colors.charcoal[100],
    border: colors.charcoal[500],
    card: colors.charcoal[850],
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[400],
    background: colors.white,
  },
};

export function useThemeConfig() {
  const { theme } = useUniwind();

  if (theme === 'dark')
    return DarkTheme;

  return LightTheme;
}
