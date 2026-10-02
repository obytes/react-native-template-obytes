import * as React from 'react';
import { Path, Svg } from 'react-native-svg';

import colors from '@/components/ui/colors';

export function PlusGlyph({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path d="M12 5v14M5 12h14" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
