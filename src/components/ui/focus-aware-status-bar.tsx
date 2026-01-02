import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

import { useAppTheme } from '@/lib/contexts/app-theme-context';

type Props = { hidden?: boolean };
export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  const { currentTheme } = useAppTheme();

  if (Platform.OS === 'web') return null;

  return isFocused ? (
    <SystemBars
      style={currentTheme === 'light' ? 'dark' : 'light'}
      hidden={hidden}
    />
  ) : null;
};
