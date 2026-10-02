import type { CharityResult } from '@/features/paddock/types';

import { useRouter } from 'expo-router';

import { Pressable, Text } from '@/components/ui';
import { formatEuro } from '@/features/paddock/lib/format-euro';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type CharitySnapshotTileProps = {
  data: CharityResult | undefined;
  isLoading: boolean;
};

export function CharitySnapshotTile({ data, isLoading }: CharitySnapshotTileProps) {
  const router = useRouter();
  const charity = data?.charity ?? null;

  // Unconfigured, empty, and error/offline all render nothing (S11-01 rule).
  if (!isLoading && !charity)
    return null;

  return (
    <TileWrapper title="Charity" isLoading={isLoading}>
      {charity
        ? (
            <Pressable
              testID="charity-snapshot-tile"
              onPress={() => router.push('/paddock/charity')}
              className="gap-2 px-6 py-4"
            >
              <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">Raised together, to date</Text>
              <Text className="font-display text-4xl tracking-tight text-ink">{formatEuro(charity.totalCents)}</Text>
              <Text className="font-sans text-sm text-ink-variant">{`${charity.percentage}% of every membership goes to ${charity.charityName}`}</Text>
              <Text className="font-sans text-sm text-primary">See our impact →</Text>
            </Pressable>
          )
        : null}
    </TileWrapper>
  );
}
