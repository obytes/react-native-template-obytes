import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

/** Caret right. Extracted from the Figma file (node-derived, stroked centreline). */
export function CaretRightV2({
  color = '#172741',
  size = 24,
  strokeWidth = 1.7,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 6L15 12L9 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
