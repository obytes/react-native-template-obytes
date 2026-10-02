import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

/** Horseshoe (Stables tab). Extracted from the Figma file (node-derived, stroked centreline). */
export function HorseshoeV2({
  color = colors.ink,
  size = 24,
  strokeWidth = 1.425,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M7.883 6.854C6.458 8.517 5.825 10.337 5.825 12.238C5.825 15.642 8.437 18.492 12 18.492C15.562 18.492 18.175 15.642 18.175 12.238C18.175 10.337 17.542 8.517 16.117 6.854"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.379 5.667L8.913 5.667"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.087 5.667L17.621 5.667"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
