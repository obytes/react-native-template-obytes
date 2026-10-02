import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { LOGO_INK } from './constants';

const VIEWBOX_WIDTH = 440.19;
const VIEWBOX_HEIGHT = 396;
const ASPECT = VIEWBOX_WIDTH / VIEWBOX_HEIGHT;

export type SubmarkProps = Omit<SvgProps, 'color' | 'width' | 'height'> & {
  /** Fill colour (the SVG uses currentColor). Defaults to ink navy. */
  color?: string;
  /** Rendered width. Height follows the viewBox aspect. */
  width?: number;
  /** Rendered height. Width follows the viewBox aspect. Ignored if width is set. */
  height?: number;
};

/** Single closed <Path>: S14-04 stroke-draws this path, do not split or optimise it. */
export function Submark({ color = LOGO_INK, width, height, ...props }: SubmarkProps) {
  const w = width ?? (height !== undefined ? height * ASPECT : VIEWBOX_WIDTH / 4);
  const h = w / ASPECT;
  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      accessibilityLabel="Rionna"
      {...props}
    >
      <Path fillRule="nonzero" fill={color} d="M7 0C16.735 38.471 37.715 62.264 71.01 75.337L71.01 0L78 0C91.526 53.453 147.5 80.099 186.771 85.7C259.012 96.004 440.191 149.52 440.191 386L157.5 386L157.5 255.876C123.76 343.515 87.24 390.928 0 396L0 0L7 0Z" />
    </Svg>
  );
}
