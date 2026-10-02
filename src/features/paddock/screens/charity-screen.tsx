import type { Charity } from '@/features/paddock/types';
import type { Poll } from '@/features/polls/types';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl } from 'react-native';

import { ActivityIndicator, FocusAwareStatusBar, Image, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCharity } from '@/features/paddock/api/use-charity';
import { CharityHeader } from '@/features/paddock/components/charity-header';
import { CharityStoryRow } from '@/features/paddock/components/charity-story-row';
import { useActivePolls } from '@/features/polls/api/use-active-polls';
import { usePollVote } from '@/features/polls/api/use-poll-vote';
import { PollCard } from '@/features/polls/components/poll-card';
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
};

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-mono text-[10px] tracking-widest text-label uppercase">{children}</Text>;
}

function CharityCard({ charity, onOpenWebsite }: { charity: Charity; onOpenWebsite: (url: string) => void }) {
  return (
    <View className="gap-3 rounded-2xl border border-outline-variant bg-white p-5">
      <View className="flex-row items-center gap-3">
        {charity.logoUrl
          ? <Image source={{ uri: `${charity.logoUrl}?width=160&quality=80` }} className="size-12 rounded-lg" contentFit="contain" />
          : null}
        <Text className="flex-1 font-sans-semibold text-lg text-ink">{charity.charityName}</Text>
      </View>
      <Text className="font-sans text-sm/5 text-ink-variant">{charity.description}</Text>
      {charity.websiteUrl
        ? (
            <Pressable testID="charity-website" accessibilityRole="link" onPress={() => onOpenWebsite(charity.websiteUrl ?? '')}>
              <Text className="font-sans-semibold text-sm text-primary">Visit website →</Text>
            </Pressable>
          )
        : null}
    </View>
  );
}

function CharityBody({ charity, poll, onOpenStory, onOpenWebsite, onVote, pendingPollIds }: Omit<CharityViewProps, 'isLoading' | 'isError' | 'isRefetching' | 'onRefresh'> & { charity: Charity }) {
  return (
    <View className="gap-6">
      <CharityHeader charity={charity} />
      <View className="gap-3">
        <SectionTitle>Current charity</SectionTitle>
        <CharityCard charity={charity} onOpenWebsite={onOpenWebsite} />
      </View>
      {charity.stories.length > 0
        ? (
            <View className="gap-3">
              <SectionTitle>Impact stories</SectionTitle>
              {charity.stories.map(story => <CharityStoryRow key={story.id} story={story} onOpen={onOpenStory} />)}
            </View>
          )
        : null}
      {poll
        ? (
            <View className="gap-3">
              <SectionTitle>Member vote</SectionTitle>
              <PollCard poll={poll} onVote={onVote} pending={pendingPollIds.includes(poll.id)} variant="card" />
            </View>
          )
        : null}
    </View>
  );
}

export function CharityView(props: CharityViewProps) {
  const { charity, isLoading, isError, isRefetching, onRefresh } = props;
  const showLoading = isLoading && charity === undefined;
  const showUnavailable = !showLoading && isError && charity === undefined;
  const showEmpty = !showLoading && !showUnavailable && charity === null;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        {showLoading ? <View testID="charity-loading" className="items-center py-16"><ActivityIndicator /></View> : null}
        {showUnavailable
          ? (
              <View testID="charity-unavailable" className="rounded-2xl border border-outline-variant bg-white p-6">
                <Text className="font-sans-semibold text-lg text-ink">Charity impact unavailable</Text>
                <Text className="mt-2 font-sans text-sm/5 text-ink-variant">Check your connection and pull down to try again.</Text>
              </View>
            )
          : null}
        {showEmpty
          ? (
              <View testID="charity-empty" className="rounded-2xl border border-outline-variant bg-white p-6">
                <Text className="font-sans-semibold text-lg text-ink">Coming soon</Text>
                <Text className="mt-2 font-sans text-sm/5 text-ink-variant">The club will announce its charity partner here.</Text>
              </View>
            )
          : null}
        {charity ? <CharityBody {...props} charity={charity} /> : null}
      </ScrollView>
    </>
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
    />
  );
}
