import type { StyleProp, ViewStyle } from 'react-native';
import type { TileKind } from '@/components/brand/pattern';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { PatternFill } from '@/components/brand/pattern';

import { Text } from './text';

/**
 * Fallback colourways (S13-01 §6, decision 8):
 * - `navy`: horses (hero, card, avatar)
 * - `green`: charity and wellbeing
 * - `plum`: Paddock and community
 * - `cream`: generic content (news, Inside Track, events)
 */
export type FallbackColourway = 'navy' | 'green' | 'plum' | 'cream';

const BASE_BG: Record<FallbackColourway, string> = {
  navy: 'bg-primary',
  green: 'bg-forest',
  plum: 'bg-plum',
  cream: 'bg-secondary-container',
};

export type PhotoFallbackProps = {
  colourway?: FallbackColourway;
  /** Centred initials (e.g. a horse or member name's initials). */
  initials?: string;
  kind?: TileKind;
  /** Tile edge in points (grown automatically to cap the tile count). */
  tileSize?: number;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Pattern fill used wherever an image is missing or fails to load. Fills its
 * box; give it a size (or absolute-fill it) from the parent.
 */
export function PhotoFallback({
  colourway = 'cream',
  initials,
  kind = 'harlequin',
  tileSize,
  borderRadius = 0,
  className,
  style,
  testID,
}: PhotoFallbackProps) {
  const spec = React.useMemo(() => ({ kind, colourway, turn: 0 as const }), [kind, colourway]);
  return (
    <View
      testID={testID}
      className={twMerge('items-center justify-center overflow-hidden', BASE_BG[colourway], className)}
      style={[{ borderRadius }, style]}
      accessibilityElementsHidden={!initials}
      importantForAccessibility={initials ? 'auto' : 'no-hide-descendants'}
    >
      <PatternFill spec={spec} tileSize={tileSize} borderRadius={borderRadius} style={StyleSheet.absoluteFill} />
      {initials
        ? (
            <Text
              variant="display-sm"
              // On cream, white initials would vanish; ink keeps the contrast.
              className={colourway === 'cream' ? 'text-ink' : 'text-on-primary'}
              testID={testID ? `${testID}-initials` : undefined}
            >
              {initials}
            </Text>
          )
        : null}
    </View>
  );
}
