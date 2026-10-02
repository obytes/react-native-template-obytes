import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import colors from '@/components/ui/colors';

type IconProps = { size?: number; color?: string };

export function CopyIcon({ size = 18, color = colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="8" y="8" width="12" height="12" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ArticleIcon({ size = 14, color = colors.forest }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M7 9h5M7 13h10M7 16h10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
