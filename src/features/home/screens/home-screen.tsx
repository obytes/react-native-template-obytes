import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl } from 'react-native';

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
import { CharitySnapshotTile } from '@/features/home/components/charity-snapshot-tile';
import { ClubVoteTile } from '@/features/home/components/club-vote-tile';
import { HeadlineCard } from '@/features/home/components/headline-card';
import { InsideTrackTile } from '@/features/home/components/inside-track-tile';
import { NextEventTile } from '@/features/home/components/next-event-tile';
import { NotificationsBell } from '@/features/home/components/notifications-bell';
import { PaddockPreviewTile } from '@/features/home/components/paddock-preview-tile';
import { selectHeadline } from '@/features/home/lib/select-headline';
import { useHomeQueries } from '@/features/home/lib/use-home-queries';
import { usePollVote } from '@/features/polls/api/use-poll-vote';
import { LatestNewsTile } from '@/features/pulse/components/latest-news-tile';
import { LatestResultsTile } from '@/features/pulse/components/latest-results-tile';
import { MyHorsesTile } from '@/features/pulse/components/my-horses-tile';
import { NextRunTile } from '@/features/pulse/components/next-run-tile';
import { TrainerUpdatesTile } from '@/features/pulse/components/trainer-updates-tile';

export function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();

  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );

  const q = useHomeQueries(scope);
  const { vote, pendingPollIds } = usePollVote(scope);

  const headline = selectHeadline(
    {
      nextRun: q.nextRun.data,
      latestResult: q.results.data?.[0] ?? null,
      latestNews: q.news.data?.[0] ?? null,
    },
    new Date(),
  );

  const displayName = user?.name?.trim() || 'Rionna member';

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
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetchAll} />}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-mono text-[10px] tracking-widest text-label uppercase">
              Rionna Ireland
            </Text>
            <Text className="mt-2 font-sans-semibold text-3xl text-ink">Home</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <NotificationsBell scope={scope} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              testID="home-avatar"
              onPress={() => router.push('/profile')}
              className="size-11 items-center justify-center rounded-full border border-outline-variant bg-white"
            >
              <Text className="font-sans-semibold text-base text-ink">
                {displayName.slice(0, 1).toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-6">
          <HeadlineCard headline={headline} />
          <ClubVoteTile
            data={q.activePolls.data}
            isLoading={q.activePolls.isLoading}
            onVote={(pollId, optionId) => vote({ pollId, optionId })}
            pendingPollIds={pendingPollIds}
          />
          <CharitySnapshotTile data={q.charity.data} isLoading={q.charity.isLoading} />
          <PaddockPreviewTile data={q.offers.data} isLoading={q.offers.isLoading} />
          <NextRunTile data={q.nextRun.data} isLoading={q.nextRun.isLoading} />
          <MyHorsesTile data={q.followedHorses.data} isLoading={q.followedHorses.isLoading} />
          <LatestResultsTile data={q.results.data} isLoading={q.results.isLoading} />
          <TrainerUpdatesTile data={q.trainerUpdates.data} isLoading={q.trainerUpdates.isLoading} />
          <LatestNewsTile data={q.news.data} isLoading={q.news.isLoading} />
          <InsideTrackTile data={q.insideTrack.data} isLoading={q.insideTrack.isLoading} />
          <NextEventTile data={q.upcomingEvents.data} isLoading={q.upcomingEvents.isLoading} />
        </View>
      </ScrollView>
    </>
  );
}
