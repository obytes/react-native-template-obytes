import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Image } from './image';
import { getInitials } from './initials';
import { PhotoFallback } from './photo-fallback';
import { Text } from './text';

export type AvatarProps = {
  /** Photo URL. Without it (or if it fails to load) the initials render. */
  uri?: string | null;
  /** Full name: the initials source and the accessibility label. */
  name?: string | null;
  /** Diameter in points (Home header avatar is 41). */
  size?: number;
  /** 2pt lilac ring: the "you" avatar on Home / Profile. */
  ring?: boolean;
  /**
   * `member` (default): initials on lilac with ink text.
   * `horse`: navy pattern fallback with white initials (decision 8).
   */
  kind?: 'member' | 'horse';
  className?: string;
  testID?: string;
};

/** Round member or horse avatar (S13-01 §6). */
export function Avatar({
  uri,
  name,
  size = 41,
  ring = false,
  kind = 'member',
  className,
  testID,
}: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const initials = getInitials(name);
  const showPhoto = Boolean(uri) && !failed;
  // The ring is drawn outside the photo (children paint over borders in RN).
  const inner = ring ? size - 4 : size;
  const box = { width: inner, height: inner, borderRadius: inner / 2 };

  let body: React.ReactNode;
  if (showPhoto) {
    body = (
      <Image
        source={{ uri: uri! }}
        style={box}
        contentFit="cover"
        onError={() => setFailed(true)}
        testID={testID ? `${testID}-image` : undefined}
      />
    );
  }
  else if (kind === 'horse') {
    body = (
      <PhotoFallback
        colourway="navy"
        tileSize={inner}
        style={[box, StyleSheet.absoluteFill]}
        testID={testID ? `${testID}-fallback` : undefined}
      />
    );
  }
  else {
    body = null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name ?? undefined}
      className={twMerge(
        'items-center justify-center overflow-hidden',
        !showPhoto && kind === 'member' && 'bg-primary-fixed',
        ring && 'border-2 border-on-primary-container',
        className,
      )}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {body}
      {!showPhoto && initials
        ? (
            <Text
              testID={testID ? `${testID}-initials` : undefined}
              className={twMerge(
                'absolute font-sans-semibold',
                kind === 'horse' ? 'text-on-primary' : 'text-ink',
              )}
              style={{ fontSize: Math.round(inner * 0.36), lineHeight: Math.round(inner * 0.46) }}
              maxFontSizeMultiplier={1}
            >
              {initials}
            </Text>
          )
        : null}
    </View>
  );
}
