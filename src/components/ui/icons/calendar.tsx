import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import colors from '@/components/ui/colors';

export function Calendar({ color = colors.ink, ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M8 2.4a1.2 1.2 0 0 1 1.2 1.2v.6h5.6v-.6a1.2 1.2 0 1 1 2.4 0v.6h.4a3.6 3.6 0 0 1 3.6 3.6v9.8a3.6 3.6 0 0 1-3.6 3.6H6.4a3.6 3.6 0 0 1-3.6-3.6V7.8a3.6 3.6 0 0 1 3.6-3.6h.4v-.6A1.2 1.2 0 0 1 8 2.4Zm10.8 8H5.2v7.2c0 .66.54 1.2 1.2 1.2h11.2c.66 0 1.2-.54 1.2-1.2v-7.2Z"
        fill={color}
      />
    </Svg>
  );
}
