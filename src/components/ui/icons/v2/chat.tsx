import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

/** Chat bubble (Community tab). Extracted from the Figma file (node-derived, stroked centreline). */
export function ChatV2({
  color = colors.ink,
  size = 24,
  strokeWidth = 1.725,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M20.625 11.521C20.625 12.591 20.414 13.65 20.005 14.638C19.596 15.626 18.996 16.524 18.239 17.281C17.483 18.037 16.585 18.637 15.596 19.047C14.608 19.456 13.549 19.667 12.479 19.667C11.042 19.667 9.604 19.283 8.358 18.612L3.375 19.667L4.429 14.683C4.01 12.536 4.461 10.309 5.683 8.494C6.905 6.679 8.798 5.424 10.946 5.004C13.094 4.585 15.32 5.036 17.135 6.258C18.95 7.48 20.206 9.373 20.625 11.521Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
