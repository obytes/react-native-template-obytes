import type { Poll } from '@/features/polls/types';

import Env from 'env';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { ActivityIndicator, FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useActivePolls } from '@/features/polls/api/use-active-polls';
import { usePollVote } from '@/features/polls/api/use-poll-vote';
import { PollCard } from '@/features/polls/components/poll-card';

type PollScreenViewProps = {
  poll: Poll | undefined;
  isLoading: boolean;
  onVote: (pollId: string, optionId: string) => void;
  pendingPollIds: string[];
};

export function PollScreenView({ poll, isLoading, onVote, pendingPollIds }: PollScreenViewProps) {
  const contentPaddingTop = useScreenTopPadding();
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: contentPaddingTop, paddingBottom: 32 }}
      >
        <Text className="font-mono text-[10px] tracking-widest text-label uppercase">Club vote</Text>
        <View className="mt-6">
          {isLoading && !poll ? <ActivityIndicator /> : null}
          {!isLoading && !poll
            ? (
                <View className="items-center py-16">
                  <Text className="font-sans text-lg font-semibold text-ink">This vote has ended</Text>
                  <Text className="mt-2 font-sans text-sm text-ink-variant">
                    Results stay in the Community feed for a week after closing.
                  </Text>
                </View>
              )
            : null}
          {poll ? <PollCard poll={poll} onVote={onVote} pending={pendingPollIds.includes(poll.id)} variant="card" /> : null}
        </View>
      </ScrollView>
    </>
  );
}

export function PollScreen() {
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
    <PollScreenView
      poll={poll}
      isLoading={polls.isLoading}
      onVote={(id, optionId) => vote({ pollId: id, optionId })}
      pendingPollIds={pendingPollIds}
    />
  );
}
