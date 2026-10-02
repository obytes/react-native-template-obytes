import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

/** Calendar (Events tab). Extracted from the Figma file (node-derived, stroked centreline). */
export function CalendarV2({
  color = '#172741',
  size = 24,
  strokeWidth = 1.425,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M7.646 6.854L16.354 6.854C17.447 6.854 18.333 7.74 18.333 8.833L18.333 16.75C18.333 17.843 17.447 18.729 16.354 18.729L7.646 18.729C6.553 18.729 5.667 17.843 5.667 16.75L5.667 8.833C5.667 7.74 6.553 6.854 7.646 6.854Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.667 10.813L18.333 10.813"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.229 5.271L9.229 8.438"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.771 5.271L14.771 8.438"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
