import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = {
  hidden?: boolean;
  /**
   * Status-bar content colour. The app is light-only, so the default is
   * `'dark'` (dark-content) for light pages. Use `'light'` (light-content)
   * over navy surfaces (splash, login) and photo heroes (Horse detail).
   */
  barStyle?: 'dark' | 'light';
};

export function FocusAwareStatusBar({ hidden = false, barStyle = 'dark' }: Props) {
  const isFocused = useIsFocused();

  if (Platform.OS === 'web')
    return null;

  return isFocused
    ? <SystemBars style={barStyle} hidden={hidden} />
    : null;
}
