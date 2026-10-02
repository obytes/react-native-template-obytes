import type { TileSpec } from '@/components/brand/pattern';
import type { JourneyBadge } from '@/features/paddock/components/journey-card';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { PatternTile } from '@/components/brand/pattern';
import {
  Card,
  colors,
  FocusAwareStatusBar,
  MonoLabel,
  Pressable,
  ScreenBackground,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { CaretRightV2 } from '@/components/ui/icons/v2';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCharity } from '@/features/paddock/api/use-charity';
import { useOffers } from '@/features/paddock/api/use-offers';
import { JourneyCard } from '@/features/paddock/components/journey-card';
import { charitySubtitle, offersSubtitle } from '@/features/paddock/lib/hub-copy';

const TILE_PLUM: TileSpec = { kind: 'gem', colourway: 'plum', turn: 0 };
const TILE_NAVY: TileSpec = { kind: 'gem', colourway: 'navy', turn: 0 };
const TILE_GREEN: TileSpec = { kind: 'gem', colourway: 'green', turn: 0 };

function RowIcon({ spec }: { spec: TileSpec }) {
  return (
    <View className="size-12 overflow-hidden rounded-lg">
      <PatternTile spec={spec} size={48} />
    </View>
  );
}

type HubRowProps = {
  title: string;
  subtitle: string;
  spec: TileSpec;
  onPress?: () => void;
  comingSoon?: boolean;
};

function HubRow({ title, subtitle, spec, onPress, comingSoon }: HubRowProps) {
  const body = (
    <Card className="min-h-[72px] flex-row items-center gap-4" style={comingSoon ? { opacity: 0.6 } : undefined}>
      <RowIcon spec={spec} />
      <View className="flex-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text variant="body-lg">{title}</Text>
          {comingSoon
            ? (
                <View className="rounded-full bg-label/10 px-2 py-1">
                  <MonoLabel size="sm">Coming soon</MonoLabel>
                </View>
              )
            : null}
        </View>
        <Text variant="body-sm" className="text-ink-variant">{subtitle}</Text>
      </View>
      {comingSoon ? null : <CaretRightV2 size={20} color={colors.ink} />}
    </Card>
  );

  if (comingSoon || !onPress) {
    return (
      <View testID={`paddock-row-${title}`} accessibilityState={{ disabled: true }}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      testID={`paddock-row-${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
    >
      {body}
    </Pressable>
  );
}

type PaddockHubViewProps = {
  offersCount: number | null;
  charitySummary: string;
  badges?: JourneyBadge[];
  onOpenBenefits: () => void;
  onOpenCharity: () => void;
};

export function PaddockHubView({ offersCount, charitySummary, badges = [], onOpenBenefits, onOpenCharity }: PaddockHubViewProps) {
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();

  return (
    <View className="flex-1 bg-background">
      <ScreenBackground />
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
          gap: 32,
        }}
      >
        <View className="gap-2">
          <Text variant="display-lg" accessibilityRole="header">Paddock</Text>
          <Text variant="body">
            {'Everything that comes with being '}
            <Text variant="body" className="text-plum-mid">one of us.</Text>
          </Text>
        </View>
        <View className="gap-3">
          <JourneyCard badges={badges} />
          <View className="gap-2">
            <HubRow title="Membership Benefits" subtitle={offersSubtitle(offersCount)} spec={TILE_PLUM} onPress={onOpenBenefits} />
            <HubRow title="Merchandise" subtitle="Caps, jackets, polos, accessories" spec={TILE_NAVY} comingSoon />
            <HubRow title="Charity Snapshot" subtitle={charitySummary} spec={TILE_GREEN} onPress={onOpenCharity} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function PaddockScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );
  const offers = useOffers(scope);
  const charity = useCharity(scope);
  // S13-12 (founding-member flag) is not served yet: no badge, so the journey card stays hidden.
  const badges: JourneyBadge[] = [];

  return (
    <PaddockHubView
      offersCount={offers.data ? offers.data.offers.length : null}
      charitySummary={charitySubtitle(charity.data?.charity)}
      badges={badges}
      onOpenBenefits={() => router.push('/paddock/benefits')}
      onOpenCharity={() => router.push('/paddock/charity')}
    />
  );
}
