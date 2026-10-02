import type { InsideTrackResult } from '@/features/member-content/types';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Card, IconButton, MonoLabel, Tag, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { PlayV2 } from '@/components/ui/icons/v2';
import { isNewItem, pickInsideTrackTeaser } from '@/features/home/lib/card-helpers';

const INSIDE_TRACK_HEIGHT = 183;

/**
 * S13-03 §6: full-bleed photo card. "N min watch" stays hidden until S13-13
 * ships a duration. Missing image → cream pattern fallback (Card photo).
 */
export function InsideTrackCard({ data, now }: { data: InsideTrackResult | undefined; now: Date }) {
  const router = useRouter();
  const teaser = pickInsideTrackTeaser(data);
  if (!teaser)
    return null;

  const open = () => {
    if (teaser.spaceId)
      router.push(`/post/${encodeURIComponent(teaser.spaceId)}/${encodeURIComponent(teaser.id)}`);
    else
      router.push('/inside-track');
  };

  return (
    <Pressable
      testID="home-inside-track"
      accessibilityRole="button"
      accessibilityLabel={`Inside Track: ${teaser.title}`}
      onPress={open}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
    >
      <Card
        variant="photo"
        image={teaser.imageUrl}
        fallbackColourway="cream"
        className="justify-between"
        style={{ height: INSIDE_TRACK_HEIGHT }}
      >
        <View className="gap-2.5 pr-20">
          <MonoLabel tone="white">Inside Track</MonoLabel>
          <Text variant="display-md" className="text-white" numberOfLines={2}>{teaser.title}</Text>
        </View>
        <View className="flex-row items-end justify-between">
          <IconButton variant="circle" accessibilityLabel="Play" onPress={open} testID="home-inside-track-play">
            <PlayV2 size={12} color={colors.ink} />
          </IconButton>
          <View className="flex-row gap-1.5">
            {isNewItem(teaser.createdAt, now) ? <Tag variant="ice" label="NEW" testID="home-inside-track-new" /> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
