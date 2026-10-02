import type { CharityStoryTeaser } from '@/features/paddock/types';

import { colors, IconButton, Image, MonoLabel, Pressable, Text, View } from '@/components/ui';
import { ArticleIcon } from '@/features/paddock/components/paddock-icons';
import { readTimeLabel } from '@/features/paddock/lib/read-time';

type Props = { story: CharityStoryTeaser; onOpen: (slug: string) => void };

/** Latest impact story: photo on top, forest display title, read-time tag. */
export function CharityStoryCard({ story, onOpen }: Props) {
  const readTime = readTimeLabel(story);
  return (
    <Pressable
      testID={`charity-story-${story.id}`}
      accessibilityRole="button"
      accessibilityLabel={story.title}
      onPress={() => onOpen(story.slug)}
      className="overflow-hidden rounded-lg bg-white"
    >
      <View className="h-[219px]">
        <Image
          source={story.featuredImageUrl ? { uri: `${story.featuredImageUrl}?width=800&quality=80` } : undefined}
          className="size-full"
          contentFit="cover"
          fallback={{ colourway: 'green' }}
        />
        <View className="absolute top-4 left-4">
          <MonoLabel className="text-forest">Impact story</MonoLabel>
        </View>
      </View>
      <View className="gap-6 p-4">
        <Text variant="display-md" className="text-forest">{story.title}</Text>
        <View className="flex-row items-center justify-between">
          <IconButton variant="circle" accessibilityLabel="Read story" onPress={() => onOpen(story.slug)} className="bg-sage">
            <ArticleIcon size={14} color={colors.forest} />
          </IconButton>
          {readTime
            ? (
                <View testID="story-read-time" className="rounded-sm border border-forest/30 px-2 py-1.5">
                  <Text variant="body-sm" className="text-ink">{readTime}</Text>
                </View>
              )
            : null}
        </View>
      </View>
    </Pressable>
  );
}
