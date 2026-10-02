import type { EventsResult } from '@/features/events/types';

import { useRouter } from 'expo-router';

import { Pressable, Text } from '@/components/ui';
import { formatEventDate } from '@/features/events/lib/format-event-date';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type NextEventTileProps = {
  data: EventsResult | undefined;
  isLoading: boolean;
};

export function NextEventTile({ data, isLoading }: NextEventTileProps) {
  const router = useRouter();
  const nextEvent = data?.events[0];

  // Unconfigured, empty, and error/offline all render nothing (S11-01 rule).
  if (!isLoading && !nextEvent)
    return null;

  return (
    <TileWrapper title="Next event" isLoading={isLoading}>
      {nextEvent
        ? (
            <Pressable
              testID="next-event-tile"
              onPress={() =>
                router.push({
                  pathname: '/event/[event-id]',
                  params: { 'event-id': nextEvent.id },
                })}
              className="gap-2 px-6 py-4"
            >
              <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
                {formatEventDate(nextEvent.startsAt) ?? 'Date to be confirmed'}
              </Text>
              <Text className="font-sans-semibold text-base text-ink">
                {nextEvent.title}
              </Text>
              <Text className="font-sans text-sm text-primary">
                {nextEvent.rsvp.going ? 'You\'re going ✓' : 'View & RSVP →'}
              </Text>
            </Pressable>
          )
        : null}
    </TileWrapper>
  );
}
