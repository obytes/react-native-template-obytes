import type { SvgProps } from 'react-native-svg';

export type IconV2Props = Omit<SvgProps, 'color' | 'width' | 'height'> & {
  color?: string;
  /** Rendered width and height in points. */
  size?: number;
  /** Stroke width in the 24-unit viewBox (ignored by filled icons). */
  strokeWidth?: number;
};
