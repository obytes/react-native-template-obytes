import type { ActivityIndicatorProps } from 'react-native';
import * as React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';

import colors from './colors';

/**
 * Loading indicator, V2-tinted (S13-01 §6): defaults to `primary` navy.
 * Skeletons replace most spinners in S14-03.
 */
export function ActivityIndicator({ color = colors.primary, ...props }: ActivityIndicatorProps) {
  return <RNActivityIndicator color={color} {...props} />;
}
