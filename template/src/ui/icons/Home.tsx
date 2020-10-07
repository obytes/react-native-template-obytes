import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

export function Home({color, ...props}: SvgProps) {
  return (
    <Svg width={28} height={29} fill="none" {...props}>
      <Path
        d="M11 24.456v-10h6v10m-12-13l9-7 9 7v11a2 2 0 01-2 2H7a2 2 0 01-2-2v-11z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
