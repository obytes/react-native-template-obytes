import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import colors from '@/components/ui/colors';

type HeartProps = SvgProps & {
  filled?: boolean;
};

export function Heart({ color = colors.ink, filled = false, ...props }: HeartProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 20.4s-8.4-4.9-8.4-11A4.9 4.9 0 0 1 8.5 4.5c1.4 0 2.7.66 3.5 1.7a4.42 4.42 0 0 1 3.5-1.7 4.9 4.9 0 0 1 4.9 4.9c0 6.1-8.4 11-8.4 11Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
