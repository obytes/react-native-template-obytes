import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCharity } from '@/features/paddock/api/use-charity';
import { useOffers } from '@/features/paddock/api/use-offers';
import { formatEuro } from '@/features/paddock/lib/format-euro';

type HubRow = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

function PaddockRow({ row }: { row: HubRow }) {
  return (
    <Pressable
      testID={`paddock-row-${row.title}`}
      accessibilityRole="button"
      onPress={row.onPress}
      className="rounded-2xl border border-outline-variant bg-white p-5"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-base font-semibold text-ink">{row.title}</Text>
        <Text className="font-sans text-lg text-primary">›</Text>
      </View>
      <Text className="mt-1 font-sans text-sm/5 text-ink-variant">{row.subtitle}</Text>
    </Pressable>
  );
}

type PaddockHubViewProps = {
  offersCount: number | null;
  charitySummary: string | null;
  onOpenBenefits: () => void;
  onOpenCharity: () => void;
};

export function offersSubtitle(count: number | null) {
  if (count === null || count === 0)
    return 'Restaurant, hotel and lifestyle partners';
  return `${count} ${count === 1 ? 'offer' : 'offers'}`;
}

export function PaddockHubView({ offersCount, charitySummary, onOpenBenefits, onOpenCharity }: PaddockHubViewProps) {
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();

  const rows: HubRow[] = [
    { title: 'Member benefits', subtitle: offersSubtitle(offersCount), onPress: onOpenBenefits },
    { title: 'Charity impact', subtitle: charitySummary ?? 'Total donated, voting and impact stories', onPress: onOpenCharity },
  ];

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
        }}
      >
        <Text className="font-mono text-[10px] tracking-widest text-label uppercase">
          Rewards & benefits
        </Text>
        <Text className="mt-2 font-sans text-3xl font-semibold text-ink">The Paddock</Text>
        <View className="mt-6 gap-4">
          {rows.map(row => (
            <PaddockRow key={row.title} row={row} />
          ))}
        </View>
      </ScrollView>
    </>
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
  const c = charity.data?.charity;
  const charitySummary = c ? `${formatEuro(c.totalCents)} raised for ${c.charityName}` : null;

  return (
    <PaddockHubView
      offersCount={offers.data ? offers.data.offers.length : null}
      charitySummary={charitySummary}
      onOpenBenefits={() => router.push('/paddock/benefits')}
      onOpenCharity={() => router.push('/paddock/charity')}
    />
  );
}
