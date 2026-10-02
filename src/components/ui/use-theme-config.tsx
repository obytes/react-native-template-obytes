import type { Theme } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';

import colors from '@/components/ui/colors';

// Light-only (S13-01 §9): navigation chrome always uses the V2 light theme.
const LightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.ink,
    border: colors.outlineVariant,
    notification: colors.primary,
  },
};

// Kept as a hook so call sites don't change if theming ever returns.
// eslint-disable-next-line react/no-unnecessary-use-prefix
export function useThemeConfig() {
  return LightTheme;
}
