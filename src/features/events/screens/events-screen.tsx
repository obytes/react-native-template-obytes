import type { EventScope } from '@/features/events/types';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  ActivityIndicator,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useEvents } from '@/features/events/api/use-events';
import { EventCard } from '@/features/events/components/event-card';

const SEGMENTS: { value: EventScope; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const EMPTY_COPY: Record<EventScope, string> = {
  upcoming: 'No upcoming events — check back soon.',
  past: 'No past events yet.',
};

export function EventsScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();
  const [scope, setScope] = React.useState<EventScope>('upcoming');

  const memberScope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );

  const events = useEvents(memberScope, scope);
  const isLoading = events.isLoading && !events.data;
  const isUnavailable = events.isError && !events.data;
  const items = events.data?.events ?? [];

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
          Race days & socials
        </Text>
        <Text className="mt-2 font-sans text-3xl font-semibold text-ink">Events</Text>

        <View className="mt-6 flex-row gap-2">
          {SEGMENTS.map(segment => (
            <Text
              key={segment.value}
              accessibilityRole="button"
              accessibilityState={{ selected: scope === segment.value }}
              onPress={() => setScope(segment.value)}
              className={`rounded-full border px-4 py-2 font-sans text-sm ${
                scope === segment.value
                  ? 'border-primary bg-primary font-semibold text-on-primary'
                  : 'border-outline-variant bg-white text-ink-variant'
              }`}
            >
              {segment.label}
            </Text>
          ))}
        </View>

        {isLoading
          ? (
              <View testID="events-loading" className="mt-6 items-center py-16">
                <ActivityIndicator color={colors.primary} />
                <Text className="mt-3 font-sans text-sm text-ink-variant">
                  Loading events…
                </Text>
              </View>
            )
          : isUnavailable
            ? (
                <View
                  testID="events-unavailable"
                  className="mt-6 rounded-2xl border border-outline-variant bg-white p-6"
                >
                  <Text className="font-sans text-lg font-semibold text-ink">Events unavailable</Text>
                  <Text className="mt-2 font-sans text-sm/5 text-ink-variant">
                    Check your connection and try again shortly.
                  </Text>
                </View>
              )
            : items.length === 0
              ? (
                  <View testID="events-empty" className="mt-6 rounded-2xl border border-outline-variant bg-white p-6">
                    <Text className="font-sans text-lg font-semibold text-ink">
                      {scope === 'upcoming' ? 'Events are on the way' : 'Nothing here yet'}
                    </Text>
                    <Text className="mt-2 font-sans text-sm/5 text-ink-variant">
                      {EMPTY_COPY[scope]}
                    </Text>
                  </View>
                )
              : (
                  <View className="mt-6 gap-4">
                    {items.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => router.push({
                          pathname: '/event/[event-id]',
                          params: { 'event-id': event.id },
                        })}
                      />
                    ))}
                  </View>
                )}
      </ScrollView>
    </>
  );
}
