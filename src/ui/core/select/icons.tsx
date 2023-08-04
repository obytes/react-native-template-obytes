import { styled } from 'nativewind';
import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Arrow = ({ color = '#000', ...props }: SvgProps) => (
  <Svg width={15} height={15} fill="none" viewBox="0 0 15 15" {...props}>
    <Path
      d="M12.621 5.443a.469.469 0 0 0-.433-.287H2.813a.469.469 0 0 0-.434.287.492.492 0 0 0 .1.516l4.687 4.688a.48.48 0 0 0 .668 0l4.688-4.688a.492.492 0 0 0 .1-.516Z"
      fill={color}
    />
  </Svg>
);

const _Check = ({ fill = '#000', ...props }: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    <Path
      d="m20.256 6.75-10.5 10.5L4.506 12"
      stroke={fill}
      strokeWidth={2.438}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const Check = styled(_Check, {
  classProps: ['fill'],
});
