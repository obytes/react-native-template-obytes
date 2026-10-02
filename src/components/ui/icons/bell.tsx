import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import colors from '@/components/ui/colors';

export function Bell({ color = colors.ink, ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 3.5a5.6 5.6 0 0 0-5.6 5.6v3.1c0 .6-.24 1.18-.66 1.6l-1 1a1.4 1.4 0 0 0 1 2.4h12.52a1.4 1.4 0 0 0 1-2.4l-1-1a2.26 2.26 0 0 1-.66-1.6V9.1A5.6 5.6 0 0 0 12 3.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M10 19.5a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
