import type { ClubEvent } from '@/features/events/types';

import * as React from 'react';

import { PatternFill } from '@/components/brand/pattern';
import { Button, Card, Pressable, Text, View } from '@/components/ui';
import { rsvpButtonState } from '@/features/events/lib/calendar-grid';
import { eventStripColourway } from '@/features/events/lib/event-type';
import { formatEventDateLine } from '@/features/events/lib/format-event-date';
import { translate } from '@/lib/i18n';

export type EventCardProps = {
  event: ClubEvent;
  onPress: () => void;
  onToggleRsvp?: (going: boolean) => void;
  rsvpPending?: boolean;
  reminderOn?: boolean;
  onToggleReminder?: () => void;
  /** Past events: muted, no buttons. */
  past?: boolean;
};

export function EventCard({
  event,
  onPress,
  onToggleRsvp,
  rsvpPending = false,
  reminderOn = false,
  onToggleReminder,
  past = false,
}: EventCardProps) {
  const dateLine = formatEventDateLine(event.startsAt);
  const meta = [dateLine, event.type?.toLowerCase()].filter(Boolean).join(' · ');
  const state = rsvpButtonState(event);

  return (
    <Card noPadding testID={`event-card-${event.id}`} className={past ? 'opacity-60' : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={event.title}
        onPress={onPress}
        className="flex-row"
      >
        <View testID={`event-card-${event.id}-strip`} style={{ width: 36 }}>
          <PatternFill
            spec={{ kind: 'harlequin', colourway: past ? 'cream' : eventStripColourway(event.type), turn: 0 }}
            tileSize={36}
            style={{ flex: 1 }}
          />
        </View>
        <View className="flex-1 gap-2 p-4">
          {meta ? <Text variant="body-sm" className="text-ink-variant">{meta}</Text> : null}
          <Text variant="display-sm" numberOfLines={3}>{event.title}</Text>
          {!past && state !== 'hidden'
            ? (
                <View className="mt-3 flex-row gap-2">
                  <Button
                    testID={`event-card-${event.id}-rsvp`}
                    size="md"
                    fullWidth={false}
                    variant="primary"
                    label={
                      state === 'going'
                        ? translate('events.going')
                        : state === 'full' ? translate('events.full') : translate('events.rsvp')
                    }
                    disabled={state === 'full' || rsvpPending}
                    onPress={() => onToggleRsvp?.(state !== 'going')}
                  />
                  <Button
                    testID={`event-card-${event.id}-remind`}
                    size="md"
                    fullWidth={false}
                    variant="secondary"
                    label={reminderOn ? translate('events.reminding') : translate('events.remindMe')}
                    accessibilityState={{ selected: reminderOn }}
                    onPress={onToggleReminder}
                  />
                </View>
              )
            : null}
        </View>
      </Pressable>
    </Card>
  );
}
