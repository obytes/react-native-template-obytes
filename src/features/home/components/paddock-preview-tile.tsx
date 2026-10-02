import type { OffersResult } from '@/features/paddock/types';

import { useRouter } from 'expo-router';

import { Pressable, Text } from '@/components/ui';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type PaddockPreviewTileProps = {
  data: OffersResult | undefined;
  isLoading: boolean;
};

export function PaddockPreviewTile({ data, isLoading }: PaddockPreviewTileProps) {
  const router = useRouter();
  const offer = data?.offers[0];

  // Unconfigured, empty, and error/offline all render nothing (S11-01 rule).
  if (!isLoading && !offer)
    return null;

  return (
    <TileWrapper title="From the Paddock" isLoading={isLoading}>
      {offer
        ? (
            <Pressable
              testID="paddock-preview-tile"
              onPress={() => router.push('/paddock/benefits')}
              className="gap-2 px-6 py-4"
            >
              <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">New partner offer</Text>
              <Text className="font-sans text-base font-semibold text-ink">{offer.title}</Text>
              <Text className="font-sans text-sm text-ink-variant">{offer.partnerName}</Text>
              <Text className="font-sans text-sm text-primary">See all member benefits →</Text>
            </Pressable>
          )
        : null}
    </TileWrapper>
  );
}
