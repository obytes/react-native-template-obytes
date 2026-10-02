import type { IconV2Props } from './types';
import * as React from 'react';

import Svg, { Path } from 'react-native-svg';

/** Pencil (edit). Extracted from the Figma file (node-derived, filled outline). */
export function PencilV2({
  color = '#1c1b1f',
  size = 24,
  ...props
}: IconV2Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M7.435 16.565L8.258 16.565L14.934 9.889L14.111 9.067L7.435 15.743L7.435 16.565ZM6.457 17.544L6.457 15.336L15.059 6.738C15.158 6.648 15.267 6.579 15.386 6.53C15.505 6.481 15.63 6.457 15.761 6.457C15.891 6.457 16.018 6.48 16.141 6.526C16.263 6.573 16.372 6.646 16.466 6.748L17.263 7.554C17.364 7.649 17.436 7.757 17.479 7.88C17.522 8.003 17.544 8.126 17.544 8.249C17.544 8.38 17.521 8.505 17.476 8.624C17.432 8.744 17.36 8.853 17.263 8.951L8.664 17.544L6.457 17.544ZM14.515 9.485L14.111 9.067L14.934 9.889L14.515 9.485Z" fill={color} fillRule="evenodd" />
    </Svg>
  );
}
