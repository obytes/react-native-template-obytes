import type { Offer } from '@/features/paddock/types';

import Env from 'env';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { ActivityIndicator, FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useOffers } from '@/features/paddock/api/use-offers';
import { OfferCard } from '@/features/paddock/components/offer-card';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { openExternalLink } from '@/lib/open-external-link';

type BenefitsViewProps = {
  offers: Offer[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onCopyCode: (code: string) => void;
  onOpenLink: (url: string) => void;
};

function StateCard({ testID, title, message }: { testID: string; title: string; message: string }) {
  return (
    <View testID={testID} className="rounded-2xl border border-outline-variant bg-white p-6">
      <Text className="font-sans text-lg font-semibold text-ink">{title}</Text>
      <Text className="mt-2 font-sans text-sm/5 text-ink-variant">{message}</Text>
    </View>
  );
}

export function BenefitsView({ offers, isLoading, isError, isRefetching, onRefresh, onCopyCode, onOpenLink }: BenefitsViewProps) {
  const showLoading = isLoading && !offers;
  const showUnavailable = !showLoading && isError && !offers;
  const showEmpty = !showLoading && !showUnavailable && offers?.length === 0;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        <Text className="font-mono text-[10px] tracking-widest text-label uppercase">Member benefits</Text>
        <Text className="mt-2 font-sans text-2xl font-semibold text-ink">The good life, members' rates</Text>
        <View className="mt-6 gap-4">
          {showLoading
            ? (
                <View testID="benefits-loading" className="items-center py-16"><ActivityIndicator /></View>
              )
            : null}
          {showUnavailable
            ? <StateCard testID="benefits-unavailable" title="Offers unavailable" message="Check your connection and pull down to try again." />
            : null}
          {showEmpty
            ? <StateCard testID="benefits-empty" title="No offers yet" message="Partner offers will appear here as the club adds them." />
            : null}
          {offers?.map(offer => (
            <OfferCard key={offer.id} offer={offer} onCopyCode={onCopyCode} onOpenLink={onOpenLink} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export function BenefitsScreen() {
  const user = useAuthStore.use.user();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );
  const offers = useOffers(scope);

  const onCopyCode = async (code: string) => {
    const ok = await copyToClipboard(code);
    showMessage({
      message: ok ? 'Code copied' : 'Copy unavailable — long-press the code to select it',
      type: ok ? 'success' : 'warning',
    });
  };

  return (
    <BenefitsView
      offers={offers.data?.offers}
      isLoading={offers.isLoading}
      isError={offers.isError}
      isRefetching={offers.isRefetching}
      onRefresh={() => void offers.refetch()}
      onCopyCode={code => void onCopyCode(code)}
      onOpenLink={openExternalLink}
    />
  );
}
