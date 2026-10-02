import type { Charity } from '@/features/paddock/types';
import type { Poll } from '@/features/polls/types';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl } from 'react-native';

import {
  ActivityIndicator,
  EmptyState,
  ErrorState,
  FocusAwareStatusBar,
  ScreenHeader,
  ScrollView,
  View,
} from '@/components/ui';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCharity } from '@/features/paddock/api/use-charity';
import { CharityStoryCard } from '@/features/paddock/components/charity-story-card';
import { CharityTotalCard } from '@/features/paddock/components/charity-total-card';
import { CharityVoteCard } from '@/features/paddock/components/charity-vote-card';
import { CurrentCharitiesCard } from '@/features/paddock/components/current-charities-card';
import { currentCharities } from '@/features/paddock/lib/current-charities';
import { useActivePolls } from '@/features/polls/api/use-active-polls';
import { usePollVote } from '@/features/polls/api/use-poll-vote';
import { openExternalLink } from '@/lib/open-external-link';

type CharityViewProps = {
  charity: Charity | null | undefined;
  poll: Poll | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onOpenStory: (slug: string) => void;
  onOpenWebsite: (url: string) => void;
  onVote: (pollId: string, optionId: string) => void;
  pendingPollIds: string[];
  onBack?: () => void;
};

function CharityBody({ charity, poll, onOpenStory, onOpenWebsite, onVote, pendingPollIds }: Omit<CharityViewProps, 'isLoading' | 'isError' | 'isRefetching' | 'onRefresh' | 'onBack'> & { charity: Charity }) {
  const story = charity.stories[0];
  return (
    <View className="gap-3">
      <CharityTotalCard charity={charity} />
      <CurrentCharitiesCard charities={currentCharities(charity)} onOpen={onOpenWebsite} />
      {story ? <CharityStoryCard story={story} onOpen={onOpenStory} /> : null}
      {poll ? <CharityVoteCard poll={poll} onVote={onVote} pending={pendingPollIds.includes(poll.id)} /> : null}
    </View>
  );
}

export function CharityView(props: CharityViewProps) {
  const { charity, isLoading, isError, isRefetching, onRefresh, onBack } = props;
  const showLoading = isLoading && charity === undefined;
  const showUnavailable = !showLoading && isError && charity === undefined;
  const showEmpty = !showLoading && !showUnavailable && charity === null;
  const paddingBottom = useTabBarContentPadding(24);

  return (
    <View className="flex-1 bg-secondary-container">
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom, gap: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        <ScreenHeader kicker="CHARITY" onBack={onBack} />
        <View className="px-4">
          {showLoading ? <View testID="charity-loading" className="items-center py-16"><ActivityIndicator /></View> : null}
          {showUnavailable
            ? <ErrorState testID="charity-unavailable" kicker="CHARITY" title="Charity impact unavailable" body="Check your connection and try again." onRetry={onRefresh} retrying={isRefetching} />
            : null}
          {showEmpty
            ? <EmptyState testID="charity-empty" kicker="CHARITY" title="Coming soon" body="The club will announce its charity partner here." />
            : null}
          {charity ? <CharityBody {...props} charity={charity} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

export function CharityScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );
  const charity = useCharity(scope);
  const polls = useActivePolls(scope);
  const { vote, pendingPollIds } = usePollVote(scope);
  const pollId = charity.data?.charity?.pollId ?? null;
  const poll = pollId ? polls.data?.polls.find(p => p.id === pollId) : undefined;

  return (
    <CharityView
      charity={charity.data?.charity}
      poll={poll}
      isLoading={charity.isLoading}
      isError={charity.isError}
      isRefetching={charity.isRefetching}
      onRefresh={() => {
        void charity.refetch();
        void polls.refetch();
      }}
      onOpenStory={slug => router.push(`/news/${slug}`)}
      onOpenWebsite={openExternalLink}
      onVote={(id, optionId) => vote({ pollId: id, optionId })}
      pendingPollIds={pendingPollIds}
      onBack={() => router.back()}
    />
  );
}
