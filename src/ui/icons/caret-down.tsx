import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const CaretDown = ({ color = '#000', ...props }: SvgProps) => (
  <Svg width={12} height={13} fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 4.744 6 8.494l-3.75-3.75"
    />
  </Svg>
);
