import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

/** Bell. Extracted from the Figma file (node-derived, stroked centreline). */
export function BellV2({
  color = '#172741',
  size = 24,
  strokeWidth = 1.7,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18 8C18 6.409 17.368 4.883 16.243 3.757C15.117 2.632 13.591 2 12 2C10.409 2 8.883 2.632 7.757 3.757C6.632 4.883 6 6.409 6 8C6 15 3 16 3 16L21 16C21 16 18 15 18 8M10 21C10 21.53 10.211 22.039 10.586 22.414C10.961 22.789 11.47 23 12 23C12.53 23 13.039 22.789 13.414 22.414C13.789 22.039 14 21.53 14 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
