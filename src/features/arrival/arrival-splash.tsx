import * as React from 'react';

import { Wordmark } from '@/components/brand/logo';
import { colors, FocusAwareStatusBar, ScreenBackground, View } from '@/components/ui';

export type ArrivalSplashProps = {
  /** `light` = frame 1 (launch). `navy` = frame 2 (signed-out, just before login). */
  variant?: 'light' | 'navy';
};

/**
 * S13-02 frames 1 and 2: the centred wordmark on the welcome gradient. Static
 * end state; S14-04 animates the stroke-draw / hand-off on top of it.
 */
export function ArrivalSplash({ variant = 'light' }: ArrivalSplashProps) {
  const navy = variant === 'navy';
  return (
    <View testID={`arrival-splash-${variant}`} className="flex-1 items-center justify-center">
      <FocusAwareStatusBar barStyle={navy ? 'light' : 'dark'} />
      <ScreenBackground variant={navy ? 'welcome-navy' : 'welcome-light'} />
      <Wordmark width={212} color={navy ? colors.secondaryContainer : colors.ink} />
    </View>
  );
}
