import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { useUniwind } from 'uniwind';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { theme } = useUniwind();

  if (Platform.OS === 'web')
    return null;

  return isFocused
    ? (
        <SystemBars
          style={theme === 'light' ? 'dark' : 'light'}
          hidden={hidden}
        />
      )
    : null;
}
