import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function CaretDown({ ...props }: SvgProps) {
  return (
    <Svg
      width={12}
      height={13}
      fill="none"
      {...props}
      className="stroke-black dark:stroke-white"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 4.744 6 8.494l-3.75-3.75"
      />
    </Svg>
  );
}
