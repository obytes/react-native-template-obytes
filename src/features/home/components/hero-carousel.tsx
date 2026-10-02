import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { HeroSlide } from '@/features/home/lib/hero-slides';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Card, Dots, Text } from '@/components/ui';
import { splitHeadline } from '@/features/home/lib/split-headline';
import { openExternalLink } from '@/lib/open-external-link';

/** Figma "News" hero: 358×239 navy card. */
const HERO_HEIGHT = 239;

function Headline({ title }: { title: string }) {
  const { accent, rest } = splitHeadline(title);
  return (
    <Text variant="display-md" className="text-primary-fixed" numberOfLines={3} accessibilityRole="header">
      {accent}
      {rest ? <Text variant="display-md" className="text-white">{` ${rest}`}</Text> : null}
    </Text>
  );
}

function Slide({ slide, width, index }: { slide: HeroSlide; width: number; index: number }) {
  const router = useRouter();
  const onPress = () => {
    if (slide.cta.kind === 'external')
      openExternalLink(slide.cta.url);
    else
      router.push(slide.cta.href);
  };
  return (
    <Card
      variant="navy"
      testID={`home-hero-slide-${index}`}
      className="justify-between"
      style={{ width, height: HERO_HEIGHT }}
    >
      <Headline title={slide.title} />
      <View className="gap-4">
        <View className="gap-1 pr-10">
          {slide.date ? <Text variant="body-sm" className="text-white/80">{slide.date}</Text> : null}
          {slide.excerpt ? <Text variant="body" className="text-white" numberOfLines={1}>{slide.excerpt}</Text> : null}
        </View>
        <Button
          testID={`home-hero-cta-${index}`}
          variant="on-dark"
          size="md"
          fullWidth={false}
          className="self-start"
          label={slide.cta.label}
          onPress={onPress}
        />
      </View>
    </Card>
  );
}

/**
 * S13-03 §4: swipeable, paged hero. Plain horizontal paging ScrollView (≤5
 * slides, no virtualisation needed); the dots follow the scroll position.
 */
export function HeroCarousel({ slides, width }: { slides: HeroSlide[]; width: number }) {
  const [index, setIndex] = React.useState(0);

  const onScroll = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    },
    [width, slides.length],
  );

  if (slides.length === 0)
    return null;

  return (
    <View testID="home-hero" style={{ width, height: HERO_HEIGHT }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        testID="home-hero-scroll"
      >
        {slides.map((slide, i) => <Slide key={slide.key} slide={slide} width={width} index={i} />)}
      </ScrollView>
      {slides.length > 1
        ? <Dots testID="home-hero-dots" count={slides.length} index={index} className="absolute right-4 bottom-5" />
        : null}
    </View>
  );
}
