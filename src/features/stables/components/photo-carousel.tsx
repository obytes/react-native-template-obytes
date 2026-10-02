import type { HorsePhoto } from '@/features/stables/types';

import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Image } from '@/components/ui';

type PhotoCarouselProps = {
  photos: HorsePhoto[];
  /** Fires with the settled page index after a swipe (drives the hero's Dots). */
  onIndexChange?: (index: number) => void;
};

function photoSource(url: string) {
  return { uri: `${url}?width=1000&quality=80` };
}

/**
 * Photo pager for the horse hero. One photo renders statically; several
 * page horizontally. Fills its parent. No photos is the hero's job (pattern
 * fallback), so this only renders a bare placeholder for safety. Page dots
 * are drawn by the hero so they sit above the scrim.
 */
export function PhotoCarousel({ photos, onIndexChange }: PhotoCarouselProps) {
  const [width, setWidth] = React.useState(0);

  if (photos.length === 0) {
    return <View testID="photo-carousel-placeholder" className="flex-1 bg-primary" />;
  }

  if (photos.length === 1) {
    return (
      <Image
        testID="photo-carousel-single"
        source={photoSource(photos[0].url)}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        fallback={{ colourway: 'navy' }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      testID="photo-carousel"
      style={StyleSheet.absoluteFill}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          if (width > 0)
            onIndexChange?.(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
      >
        {photos.map(photo => (
          <View key={photo.url} style={{ width: width || undefined }} className="h-full">
            <Image
              source={photoSource(photo.url)}
              className="size-full"
              contentFit="cover"
              fallback={{ colourway: 'navy' }}
              accessibilityIgnoresInvertColors
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
