import { useIsFocused } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { useUniwind } from 'uniwind';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { theme } = useUniwind();

  if (Platform.OS === 'web')
    return null;

  return isFocused
    ? (
        <StatusBar
          style={theme === 'light' ? 'dark' : 'light'}
          hidden={hidden}
        />
      )
    : null;
}
