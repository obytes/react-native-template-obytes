import type { NextRunEntry } from '@/features/pulse/types';

import { useRouter } from 'expo-router';

import { Image, Pressable, Text, View } from '@/components/ui';
import { CountdownLabel } from '@/features/pulse/components/countdown-label';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type NextRunTileProps = {
  data: NextRunEntry | null | undefined;
  isLoading: boolean;
};

function NextRunPhoto({ url }: { url: string | undefined }) {
  if (url) {
    return (
      <Image
        source={{ uri: `${url}?width=400&quality=80` }}
        className="aspect-3/2 w-full"
        contentFit="cover"
      />
    );
  }

  return (
    <View className="aspect-3/2 w-full items-center justify-center bg-surface-container">
      <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">No photo</Text>
    </View>
  );
}

function NextRunContent({ entry }: { entry: NextRunEntry }) {
  const router = useRouter();
  const photoUrl = entry.horse.photos[0]?.url;

  return (
    <Pressable
      onPress={() => router.push(`/stables/${entry.horse.id}`)}
    >
      <NextRunPhoto url={photoUrl} />

      <View className="gap-2 p-6">
        <Text className="font-sans-semibold text-2xl text-ink">
          {entry.horse.name}
        </Text>
        <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
          {entry.race.meeting.course.name}
        </Text>
        {entry.jockey
          ? (
              <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
                Jockey:
                {' '}
                {entry.jockey.name}
              </Text>
            )
          : null}
        <View className="mt-4">
          <CountdownLabel postTime={entry.race.postTime} />
        </View>
      </View>
    </Pressable>
  );
}

export function NextRunTile({ data, isLoading }: NextRunTileProps) {
  return (
    <TileWrapper title="Next Run" isLoading={isLoading}>
      {data
        ? (
            <NextRunContent entry={data} />
          )
        : (
            <View className="px-6 pb-6">
              <Text className="font-sans text-base text-ink-variant">
                No upcoming runs — check back soon!
              </Text>
            </View>
          )}
    </TileWrapper>
  );
}
