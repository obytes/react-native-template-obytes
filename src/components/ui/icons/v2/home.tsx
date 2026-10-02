import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

/** Home (tab bar). Extracted from the Figma file (node-derived, stroked centreline). */
export function HomeV2({
  color = '#172741',
  size = 24,
  strokeWidth = 1.425,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5.667 11.367L12 6.062L18.333 11.367L18.333 18.333C18.333 18.543 18.25 18.745 18.101 18.893C17.953 19.042 17.752 19.125 17.542 19.125L13.9 19.125L13.9 14.692L10.1 14.692L10.1 19.125L6.458 19.125C6.248 19.125 6.047 19.042 5.899 18.893C5.75 18.745 5.667 18.543 5.667 18.333L5.667 11.367Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
