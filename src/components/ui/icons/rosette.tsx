import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import colors from '@/components/ui/colors';

export function Rosette({ color = colors.ink, ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2.4a5.6 5.6 0 0 0-5.6 5.6 5.6 5.6 0 0 0 3.2 5.06v6.14a1.2 1.2 0 0 0 1.84 1.02L12 18.9l.56 1.32a1.2 1.2 0 0 0 1.84-1.02v-6.14A5.6 5.6 0 0 0 17.6 8 5.6 5.6 0 0 0 12 2.4Zm0 2.4a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z"
        fill={color}
      />
    </Svg>
  );
}
