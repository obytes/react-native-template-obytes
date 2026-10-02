import type { InsideTrackResult } from '@/features/member-content/types';

import { useRouter } from 'expo-router';

import { Pressable, Text, View } from '@/components/ui';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type InsideTrackTileProps = {
  data: InsideTrackResult | undefined;
  isLoading: boolean;
};

export function InsideTrackTile({ data, isLoading }: InsideTrackTileProps) {
  const router = useRouter();
  const teaser = data?.latest[0] ?? data?.pinned[0];

  // Covers unconfigured, empty, AND error/offline (query errored -> data is
  // undefined, isLoading has settled to false) — all render nothing rather
  // than a non-tappable "Nothing here yet" placeholder.
  if (!isLoading && !teaser)
    return null;

  return (
    <TileWrapper title="Inside Track" isLoading={isLoading}>
      {teaser
        ? (
            <Pressable
              testID="inside-track-tile"
              onPress={() => router.push('/inside-track')}
              className="gap-2 px-6 py-4"
            >
              <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
                Latest from the Inside Track
              </Text>
              <Text className="font-sans text-base font-semibold text-ink">{teaser.title}</Text>
              <Text className="font-sans text-sm text-primary">Explore the Inside Track →</Text>
            </Pressable>
          )
        : (
            <View className="px-6 pb-6">
              <Text className="font-sans text-base text-ink-variant">Nothing here yet</Text>
            </View>
          )}
    </TileWrapper>
  );
}
