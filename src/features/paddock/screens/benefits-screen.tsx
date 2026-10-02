import type { Offer } from '@/features/paddock/types';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  ActivityIndicator,
  EmptyState,
  ErrorState,
  FocusAwareStatusBar,
  ScreenBackground,
  ScreenHeader,
  ScrollView,
  View,
} from '@/components/ui';
import { useScreenBottomPadding } from '@/components/ui/screen-layout';

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
  onBack?: () => void;
};

export function BenefitsView({ offers, isLoading, isError, isRefetching, onRefresh, onCopyCode, onOpenLink, onBack }: BenefitsViewProps) {
  const showLoading = isLoading && !offers;
  const showUnavailable = !showLoading && isError && !offers;
  const showEmpty = !showLoading && !showUnavailable && offers?.length === 0;
  const paddingBottom = useScreenBottomPadding(24);

  return (
    <View className="flex-1 bg-background">
      <ScreenBackground variant="page-ice" />
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom, gap: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        <ScreenHeader kicker="BENEFITS" title="The good life, members’ rates" onBack={onBack} />
        <View className="gap-2 px-4">
          {showLoading
            ? (
                <View testID="benefits-loading" className="items-center py-16"><ActivityIndicator /></View>
              )
            : null}
          {showUnavailable
            ? <ErrorState testID="benefits-unavailable" kicker="BENEFITS" title="Offers unavailable" body="Check your connection and try again." onRetry={onRefresh} retrying={isRefetching} />
            : null}
          {showEmpty
            ? <EmptyState testID="benefits-empty" kicker="BENEFITS" title="New partners are on the way" body="Partner offers will appear here as the club adds them." />
            : null}
          {offers?.map(offer => (
            <OfferCard key={offer.id} offer={offer} onCopyCode={onCopyCode} onOpenLink={onOpenLink} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function BenefitsScreen() {
  const router = useRouter();
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
      onBack={() => router.back()}
    />
  );
}
