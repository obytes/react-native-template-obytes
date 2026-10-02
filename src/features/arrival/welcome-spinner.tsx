import * as React from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, View } from '@/components/ui';

const SIZE = 48;

/** 48pt ring spinner: plum-mid arc on a lilac track (Figma "Loading"). */
export function WelcomeSpinner() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      testID="welcome-spinner"
      accessibilityRole="progressbar"
      style={{ width: SIZE, height: SIZE }}
    >
      <View
        className="absolute inset-0 rounded-full"
        style={{ borderWidth: 4, borderColor: colors.onPrimaryContainer }}
      />
      <Animated.View
        className="absolute inset-0 rounded-full"
        style={[
          { borderWidth: 4, borderColor: 'transparent', borderTopColor: colors.plumMid },
          style,
        ]}
      />
    </View>
  );
}
