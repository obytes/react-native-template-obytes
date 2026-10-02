import type { ImageSourcePropType } from 'react-native';
import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

import { colors, View } from '@/components/ui';
import { PlayV2 } from '@/components/ui/icons/v2';

/** Placeholder until the `expo-video` asset lands (S14-01 native build). */
export type VideoSource = string | { uri: string };

export type LoginMediaProps = {
  poster: ImageSourcePropType;
  /** Absent in S13: renders the poster + decorative play button. */
  videoSource?: VideoSource;
};

/**
 * Login hero media, 326×183 r8 (Figma "Video Player"). Decorative only until a
 * real video exists: the play button has no action and is hidden from a11y.
 */
export function LoginMedia({ poster, videoSource }: LoginMediaProps) {
  // Real playback is wired when `videoSource` is supplied (expo-video, S14-01).
  void videoSource;
  return (
    <View
      testID="login-media"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[183px] w-[326px] items-center justify-center overflow-hidden rounded-lg bg-white/6"
    >
      <Image source={poster} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <View
        testID="login-media-play"
        pointerEvents="none"
        className="size-8 items-center justify-center rounded-full bg-ice-light"
        style={{
          shadowColor: colors.navyDeep,
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <PlayV2 size={12} color={colors.ink} />
      </View>
    </View>
  );
}
