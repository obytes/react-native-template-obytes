import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

/** Play. Extracted from the Figma file (node-derived, stroked centreline). */
export function PlayV2({
  color = colors.ink,
  size = 24,
  strokeWidth = 1.7,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M7 5L18 12L7 19L7 5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
