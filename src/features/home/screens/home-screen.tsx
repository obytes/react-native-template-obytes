import type { HeroRunInput } from '@/features/home/lib/hero-slides';

import Env from 'env';
import { useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';

import {
  Avatar,
  FocusAwareStatusBar,
  Pressable,
  ScreenBackground,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { CharityCard } from '@/features/home/components/charity-card';
import { HeroCarousel } from '@/features/home/components/hero-carousel';
import { InsideTrackCard } from '@/features/home/components/inside-track-card';
import { MyHorsesCard } from '@/features/home/components/my-horses-card';
import { NotificationsBell } from '@/features/home/components/notifications-bell';
import { UpcomingEventCard } from '@/features/home/components/upcoming-event-card';
import { YardChipsRow } from '@/features/home/components/yard-chips-row';
import { greeting } from '@/features/home/lib/greeting';
import { buildHeroSlides } from '@/features/home/lib/hero-slides';
import { useHomeQueries } from '@/features/home/lib/use-home-queries';
import { buildYardChips, countEventsThisWeek, raceDayHorseIds } from '@/features/home/lib/yard-chips';

const GUTTER = 16;

/** Device clock, re-read whenever Home regains focus (greeting window, NEW tag). */
function useFocusedNow(): Date {
  const [now, setNow] = React.useState(() => new Date());
  useFocusEffect(React.useCallback(() => {
    setNow(new Date());
  }, []));
  return now;
}

type HomeQueries = ReturnType<typeof useHomeQueries>;

function useHomeModel(q: HomeQueries, now: Date) {
  const followed = q.followedHorses.data;
  const nextRun: HeroRunInput | null | undefined = q.nextRun.data;

  const chips = React.useMemo(() => {
    const followedIds = new Set((followed ?? []).map(h => h.id));
    return buildYardChips({
      raceDayHorseIds: raceDayHorseIds(nextRun ? [nextRun] : [], followedIds, now),
      unread: q.inboxBadge.data ?? 0,
      eventsThisWeek: countEventsThisWeek(q.upcomingEvents.data?.events ?? [], now),
    });
  }, [followed, nextRun, q.inboxBadge.data, q.upcomingEvents.data, now]);

  const slides = React.useMemo(
    () => buildHeroSlides({
      nextRun,
      news: q.news.data,
      results: q.results.data,
    }, now),
    [nextRun, q.news.data, q.results.data, now],
  );

  return { chips, slides };
}

function HomeHeaderRight({ scope, name }: { scope: { organizationId: string; memberId: string }; name: string | undefined }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3">
      <NotificationsBell scope={scope} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        testID="home-avatar"
        onPress={() => router.push('/profile')}
      >
        <Avatar ring size={41} name={name} />
      </Pressable>
    </View>
  );
}

export function HomeScreen() {
  const user = useAuthStore.use.user();
  const { width } = useWindowDimensions();
  const contentPaddingBottom = useTabBarContentPadding(24);
  const now = useFocusedNow();

  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );

  const q = useHomeQueries(scope);
  const { chips, slides } = useHomeModel(q, now);

  return (
    <View className="flex-1">
      <FocusAwareStatusBar barStyle="dark" />
      <ScreenBackground variant="page" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetchAll} />}
      >
        <ScreenHeader
          variant="tab-root"
          brand
          testID="home-header"
          right={<HomeHeaderRight scope={scope} name={user?.name} />}
        />
        <View className="gap-8 px-4 pt-8">
          <Text variant="display-md" accessibilityRole="header" testID="home-greeting">
            {greeting(now, user?.name)}
          </Text>
          <View className="gap-3">
            <YardChipsRow chips={chips} />
            <HeroCarousel slides={slides} width={width - GUTTER * 2} />
            <MyHorsesCard horses={q.followedHorses.data} isLoading={q.followedHorses.isLoading} />
            <InsideTrackCard data={q.insideTrack.data} now={now} />
            <CharityCard data={q.charity.data} />
            <UpcomingEventCard data={q.upcomingEvents.data} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
