import type { EventsResult } from '@/features/events/types';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Card, MonoLabel, Text } from '@/components/ui';
import { formatEventDate } from '@/features/events/lib/format-event-date';
import { slotsRemaining } from '@/features/home/lib/card-helpers';

/** S13-03 §8: the next upcoming event. Hidden when there is none. */
export function UpcomingEventCard({ data }: { data: EventsResult | undefined }) {
  const router = useRouter();
  const event = data?.events[0];
  if (!event)
    return null;

  const slots = slotsRemaining(event.rsvp);
  const date = formatEventDate(event.startsAt) ?? 'Date to be confirmed';

  return (
    <Pressable
      testID="home-event"
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/event/[event-id]', params: { 'event-id': event.id } })}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
    >
      <Card className="gap-8">
        <MonoLabel>Upcoming events</MonoLabel>
        <View className="gap-1.5">
          {slots ? <Text variant="body-sm" className="text-on-primary-container">{slots}</Text> : null}
          <Text variant="body-lg" numberOfLines={2}>{event.title}</Text>
          <Text variant="body-sm" className="text-ink-variant">{date}</Text>
        </View>
      </Card>
    </Pressable>
  );
}
