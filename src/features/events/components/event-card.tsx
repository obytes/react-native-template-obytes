import type { ClubEvent } from '@/features/events/types';

import * as React from 'react';

import { Image, Pressable, Text, View } from '@/components/ui';
import {
  formatEventDate,
  formatEventLocation,
} from '@/features/events/lib/format-event-date';

type EventCardProps = {
  event: ClubEvent;
  onPress: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  const date = formatEventDate(event.startsAt);

  return (
    <Pressable
      testID={`event-card-${event.id}`}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-outline-variant bg-white"
    >
      {event.coverImageUrl
        ? (
            <Image
              testID="event-card-cover"
              source={{ uri: event.coverImageUrl }}
              className="h-40 w-full bg-secondary-container"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={event.title}
            />
          )
        : (
            <View
              testID="event-card-placeholder"
              className="h-24 w-full items-start justify-end bg-primary px-4 pb-3"
            >
              <Text className="font-mono text-xs tracking-widest text-on-primary uppercase">
                Rionna event
              </Text>
            </View>
          )}
      <View className="gap-1 px-4 py-3">
        {date
          ? (
              <Text className="font-mono text-xs tracking-wider text-label uppercase">
                {date}
              </Text>
            )
          : null}
        <Text className="font-sans-semibold text-lg text-ink" numberOfLines={2}>
          {event.title}
        </Text>
        <Text className="font-sans text-sm text-ink-variant" numberOfLines={1}>
          {formatEventLocation(event)}
        </Text>
        {event.rsvp.going
          ? (
              <Text className="mt-1 self-start rounded-full bg-success-50 px-3 py-1 font-sans-semibold text-xs text-success-700">
                Going ✓
              </Text>
            )
          : event.rsvp.full
            ? (
                <Text className="mt-1 self-start rounded-full bg-secondary-container px-3 py-1 font-sans-semibold text-xs text-ink-variant">
                  Full
                </Text>
              )
            : null}
      </View>
    </Pressable>
  );
}
