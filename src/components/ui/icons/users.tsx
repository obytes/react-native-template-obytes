import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '@/components/ui/colors';

// Lucide "users" icon
export function Users({ color = colors.ink, ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={9}
        cy={7}
        r={4}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.128a4 4 0 0 1 0 7.744"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
