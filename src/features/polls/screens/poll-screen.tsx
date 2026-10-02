import type { Poll } from '@/features/polls/types';

import Env from 'env';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';

import { ActivityIndicator, EmptyState, FocusAwareStatusBar, ScreenHeader, ScrollView, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useActivePolls } from '@/features/polls/api/use-active-polls';
import { usePollVote } from '@/features/polls/api/use-poll-vote';
import { PollCard } from '@/features/polls/components/poll-card';

type PollScreenViewProps = {
  poll: Poll | undefined;
  isLoading: boolean;
  onVote: (pollId: string, optionId: string) => void;
  pendingPollIds: string[];
  onBack?: () => void;
};

export function PollScreenView({ poll, isLoading, onVote, pendingPollIds, onBack }: PollScreenViewProps) {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ScreenHeader kicker="Club vote" onBack={onBack} />
        <View className="mt-6 px-4">
          {isLoading && !poll ? <ActivityIndicator /> : null}
          {!isLoading && !poll
            ? (
                <EmptyState
                  title="This vote has ended"
                  body="Results stay in the Community feed for a week after closing."
                />
              )
            : null}
          {poll ? <PollCard poll={poll} onVote={onVote} pending={pendingPollIds.includes(poll.id)} variant="card" /> : null}
        </View>
      </ScrollView>
    </>
  );
}

export function PollScreen() {
  const router = useRouter();
  const { 'poll-id': pollId } = useLocalSearchParams<{ 'poll-id': string }>();
  const user = useAuthStore.use.user();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );
  const polls = useActivePolls(scope);
  const { vote, pendingPollIds } = usePollVote(scope);
  const poll = polls.data?.polls.find(p => p.id === pollId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PollScreenView
        poll={poll}
        isLoading={polls.isLoading}
        onVote={(id, optionId) => vote({ pollId: id, optionId })}
        pendingPollIds={pendingPollIds}
        onBack={() => router.back()}
      />
    </>
  );
}
