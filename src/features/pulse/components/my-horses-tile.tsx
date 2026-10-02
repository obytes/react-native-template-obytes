import type { Horse } from '@/features/stables/types';

import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { Image, Pressable, Text, View } from '@/components/ui';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type MyHorsesTileProps = {
  data: Horse[] | undefined;
  isLoading: boolean;
};

function HorseTile({ horse }: { horse: Horse }) {
  const router = useRouter();
  const photoUrl = horse.photos[0]?.url;

  return (
    <Pressable
      onPress={() => router.push(`/stables/${horse.id}`)}
      className="w-32 gap-2"
    >
      <View className="aspect-square w-32 overflow-hidden rounded-2xl bg-surface-container">
        {photoUrl
          ? (
              <Image
                source={{ uri: `${photoUrl}?width=300&quality=80` }}
                className="size-full"
                contentFit="cover"
              />
            )
          : (
              <View className="size-full items-center justify-center">
                <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">No photo</Text>
              </View>
            )}
      </View>
      <Text className="font-sans-semibold text-sm text-ink" numberOfLines={1}>
        {horse.name}
      </Text>
      <Text className="font-mono text-[10px] tracking-widest text-ink-variant uppercase" numberOfLines={1}>
        {horse.status}
      </Text>
    </Pressable>
  );
}

/**
 * Home "My Horses" tile (S8-01 §5 / S7): a horizontal row of the member's
 * followed horses, consuming useFollowedHorses. Each tile opens the horse
 * profile. Nudges toward the Stables tab when nothing is followed yet.
 */
export function MyHorsesTile({ data, isLoading }: MyHorsesTileProps) {
  const horses = data ?? [];
  const hasHorses = horses.length > 0;

  return (
    <TileWrapper title="My Horses" isLoading={isLoading}>
      {hasHorses
        ? (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingHorizontal: 24, paddingBottom: 24 }}
            >
              {horses.map(horse => (
                <HorseTile key={horse.id} horse={horse} />
              ))}
            </ScrollView>
          )
        : (
            <View className="px-6 pb-6">
              <Text className="font-sans text-base text-ink-variant">
                Follow horses in the Stables to see them here.
              </Text>
            </View>
          )}
    </TileWrapper>
  );
}
