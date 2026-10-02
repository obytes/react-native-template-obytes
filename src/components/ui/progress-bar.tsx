import * as React from 'react';
import { useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import colors from './colors';
import { withAlpha } from './gradient-styles';

/**
 * Design V2 progress bar (S13-01 §7): charity goal, spots remaining.
 * - `light` (default): cream track, navy fill.
 * - `on-plum`: translucent white track, lilac fill.
 * - `on-dark`: translucent white track, sage fill (green charity hero).
 */
export type ProgressBarTone = 'light' | 'on-plum' | 'on-dark';

const TONES: Record<ProgressBarTone, { track: string; fill: string }> = {
  'light': { track: colors.secondaryContainer, fill: colors.primary },
  'on-plum': { track: withAlpha(colors.white, 0.2), fill: colors.primaryFixed },
  'on-dark': { track: withAlpha(colors.white, 0.2), fill: colors.sage },
};

type Props = {
  /** Starting percentage (0–100) for the imperative `setProgress` API. */
  initialProgress?: number;
  /** Controlled percentage (0–100). Animates on change. */
  value?: number;
  tone?: ProgressBarTone;
  /** Bar thickness in points (default 8). */
  height?: number;
  /** Optional marker centred on the fill's leading edge (e.g. the charity star). */
  renderThumb?: () => React.ReactNode;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
};

export type ProgressBarRef = {
  setProgress: (value: number) => void;
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));
const TIMING = { duration: 250, easing: Easing.inOut(Easing.quad) };

export function ProgressBar({
  ref,
  initialProgress = 0,
  value,
  tone = 'light',
  height = 8,
  renderThumb,
  accessibilityLabel,
  className = '',
  testID,
}: Props & { ref?: React.RefObject<ProgressBarRef | null> }) {
  // Imperative updates land in state; a controlled `value` wins over it.
  const [imperative, setImperative] = React.useState(() => clamp(initialProgress));
  const now = value === undefined ? imperative : clamp(value);

  useImperativeHandle(ref, () => ({
    setProgress: (next: number) => setImperative(clamp(next)),
  }), []);

  const { track, fill } = TONES[tone];
  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${now}%`, TIMING),
    backgroundColor: fill,
    height,
    borderRadius: height / 2,
  }));
  const thumbStyle = useAnimatedStyle(() => ({ left: withTiming(`${now}%`, TIMING) }));

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(now) }}
      className={className}
      style={{ height, borderRadius: height / 2, backgroundColor: track, justifyContent: 'center' }}
    >
      <Animated.View testID={testID ? `${testID}-fill` : undefined} style={[{ position: 'absolute', left: 0 }, fillStyle]} />
      {renderThumb
        ? (
            // Zero-width anchor at the fill edge; the thumb centres on it and overflows.
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }, thumbStyle]}
            >
              <View style={{ position: 'absolute' }}>{renderThumb()}</View>
            </Animated.View>
          )
        : null}
    </View>
  );
}
