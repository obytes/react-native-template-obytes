import type { CharityStoryTeaser } from '@/features/paddock/types';

import { Image, Pressable, Text, View } from '@/components/ui';

type CharityStoryRowProps = {
  story: CharityStoryTeaser;
  onOpen: (slug: string) => void;
};

export function CharityStoryRow({ story, onOpen }: CharityStoryRowProps) {
  return (
    <Pressable
      testID={`charity-story-${story.id}`}
      accessibilityRole="button"
      onPress={() => onOpen(story.slug)}
      className="flex-row items-center gap-4 rounded-2xl border border-outline-variant bg-white p-4"
    >
      {story.featuredImageUrl
        ? <Image source={{ uri: `${story.featuredImageUrl}?width=200&quality=80` }} className="size-16 rounded-xl" contentFit="cover" />
        : <View className="size-16 rounded-xl bg-surface-container" />}
      <View className="flex-1 gap-1">
        <Text className="font-mono text-[10px] tracking-widest text-label uppercase">Impact story</Text>
        <Text className="font-sans-semibold text-base text-ink" numberOfLines={2}>{story.title}</Text>
        {story.subtitle ? <Text className="font-sans text-sm text-ink-variant" numberOfLines={1}>{story.subtitle}</Text> : null}
      </View>
      <Text className="font-sans text-lg text-primary">›</Text>
    </Pressable>
  );
}
