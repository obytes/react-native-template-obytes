import type { LatestResult } from '@/features/pulse/types';

import { useRouter } from 'expo-router';

import { Pressable, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function positionColor(pos: number | null): string {
  if (pos === 1)
    return colors.medal.gold;
  if (pos === 2)
    return colors.medal.silver;
  if (pos === 3)
    return colors.medal.bronze;
  return colors.medal.other;
}

function PositionBadge({ position }: { position: number | null }) {
  return (
    <View
      className="size-10 items-center justify-center rounded-full shadow-sm"
      style={{ backgroundColor: positionColor(position) }}
    >
      <Text className="font-sans text-sm font-bold text-white">
        {position
          ? ordinal(position)
          : '—'}
      </Text>
    </View>
  );
}

function ResultRow({ result }: { result: LatestResult }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/stables/${result.horse.id}`)}
      className="flex-row items-center gap-4 px-6 py-4"
    >
      <PositionBadge position={result.finishingPosition} />
      <View className="flex-1">
        <Text className="font-sans text-base font-semibold text-ink">
          {result.horse.name}
        </Text>
        <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
          {result.race.meeting.course.name}
        </Text>
      </View>
    </Pressable>
  );
}

type LatestResultsTileProps = {
  data: LatestResult[] | undefined;
  isLoading: boolean;
};

export function LatestResultsTile({ data, isLoading }: LatestResultsTileProps) {
  const hasResults = data && data.length > 0;

  return (
    <TileWrapper title="Latest Results" isLoading={isLoading}>
      {hasResults
        ? (
            <View className="pb-2">
              {data.map(result => (
                <ResultRow key={result.id} result={result} />
              ))}
            </View>
          )
        : (
            <View className="px-6 pb-6">
              <Text className="font-sans text-base text-ink-variant">No results yet</Text>
            </View>
          )}
    </TileWrapper>
  );
}
