import type { ViewProps } from 'react-native';
import type { GradientVariant } from './gradient-styles';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { gradientStyle } from './gradient-styles';

// Variant → style mapping and the design notes live in gradient-styles.ts.

type GradientProps = ViewProps & {
  variant: GradientVariant;
  className?: string;
};

export function Gradient({ variant, style, ...props }: GradientProps) {
  const gradient = React.useMemo(() => gradientStyle(variant), [variant]);
  return <View {...props} style={[gradient, style]} />;
}

type ScreenBackgroundProps = {
  variant?: Extract<GradientVariant, 'page' | 'page-ice' | 'welcome-light' | 'welcome-navy'>;
  testID?: string;
};

/**
 * Fixed full-screen gradient layer. Render it as the first child of a
 * screen's root `flex-1` view, before the ScrollView/FlashList, so content
 * scrolls over a background that doesn't move or stretch.
 */
export function ScreenBackground({ variant = 'page', testID }: ScreenBackgroundProps) {
  return (
    <Gradient
      testID={testID}
      variant={variant}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />
  );
}
