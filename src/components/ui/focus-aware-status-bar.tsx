import { useIsFocused } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = { hidden?: boolean };
export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  return isFocused ? <SystemBars style={colorScheme} hidden={hidden} /> : null;
};
