import type { AddToCalendarOutcome } from '@/features/events/lib/add-to-calendar';
import type { ClubEvent } from '@/features/events/types';

import Env from 'env';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Linking } from 'react-native';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { RsvpError, useEventRsvp } from '@/features/events/api/use-event-rsvp';
import { findEventById, useEvents } from '@/features/events/api/use-events';
import { addEventToDeviceCalendar } from '@/features/events/lib/add-to-calendar';
import { formatEventDate, formatEventLocation } from '@/features/events/lib/format-event-date';
import { CircleTiptapRenderer } from '@/features/member-content/components/circle-tiptap-renderer';
import { hydrateCircleDoc } from '@/features/member-content/tiptap/hydrate';
import { circleDocHasContent } from '@/features/member-content/tiptap/native-support';
import { openExternalLink } from '@/lib/open-external-link';

const CALENDAR_OUTCOME_LABEL: Record<AddToCalendarOutcome, string> = {
  added: 'Added to your calendar ✓',
  denied: 'Calendar permission denied',
  failed: 'Couldn\'t add to calendar',
};

function EventCover({ event }: { event: ClubEvent }) {
  if (event.coverImageUrl) {
    return (
      <Image
        testID="event-detail-cover"
        source={{ uri: event.coverImageUrl }}
        className="h-56 w-full bg-secondary-container"
        contentFit="cover"
        cachePolicy="memory-disk"
        accessibilityLabel={event.title}
      />
    );
  }
  return (
    <View
      testID="event-detail-placeholder"
      className="h-40 w-full items-start justify-end bg-primary px-5 pb-4"
    >
      <Text className="font-mono text-xs tracking-widest text-on-primary uppercase">
        Rionna event
      </Text>
    </View>
  );
}

function EventLocationLine({ event }: { event: ClubEvent }) {
  if (!event.inPersonLocation && event.virtualLocationUrl) {
    return (
      <Pressable
        testID="event-location-link"
        accessibilityRole="link"
        onPress={() => openExternalLink(event.virtualLocationUrl!)}
      >
        <Text className="font-sans text-sm font-semibold text-primary underline">
          Join online
        </Text>
      </Pressable>
    );
  }
  return (
    <Text className="font-sans text-sm text-ink-variant">
      {formatEventLocation(event)}
    </Text>
  );
}

function RsvpButton({
  event,
  onToggleRsvp,
  rsvpPending,
  showFull,
}: {
  event: ClubEvent;
  onToggleRsvp?: (going: boolean) => void;
  rsvpPending: boolean;
  showFull: boolean;
}) {
  if (event.rsvp.disabled) {
    return null;
  }

  if (showFull) {
    return (
      <View
        testID="event-rsvp-cta"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        className="mt-1 items-center rounded-full border border-outline-variant bg-secondary-container py-3"
      >
        <Text className="font-sans text-sm font-semibold text-ink-muted">Event full</Text>
      </View>
    );
  }

  const going = event.rsvp.going;
  return (
    <Pressable
      testID="event-rsvp-cta"
      accessibilityRole="button"
      accessibilityLabel={going ? 'Cancel RSVP' : 'RSVP to this event'}
      disabled={rsvpPending}
      onPress={() => onToggleRsvp?.(!going)}
      className={`mt-1 items-center rounded-full py-3 ${going ? 'bg-success-50' : 'bg-primary'} ${rsvpPending ? 'opacity-60' : ''}`}
    >
      <Text className={`font-sans text-sm font-semibold ${going ? 'text-success-700' : 'text-on-primary'}`}>
        {going ? 'Going ✓ — tap to cancel' : 'RSVP — I\'m going'}
      </Text>
    </Pressable>
  );
}

function AddToCalendarButton({
  onAddToCalendar,
  calendarPending,
  calendarOutcome,
}: {
  onAddToCalendar?: () => void;
  calendarPending: boolean;
  calendarOutcome: AddToCalendarOutcome | null;
}) {
  return (
    <View className="mt-2 gap-1.5">
      <Pressable
        testID="event-add-to-calendar"
        accessibilityRole="button"
        accessibilityLabel="Add to calendar"
        disabled={calendarPending}
        onPress={onAddToCalendar}
        className={`items-center rounded-full border border-primary bg-white py-3 ${calendarPending ? 'opacity-60' : ''}`}
      >
        <Text className="font-sans text-sm font-semibold text-primary">
          {calendarPending ? 'Adding…' : 'Add to calendar'}
        </Text>
      </Pressable>
      {calendarOutcome
        ? (
            <Text
              testID="event-add-to-calendar-outcome"
              className="text-center font-sans text-xs text-ink-muted"
            >
              {CALENDAR_OUTCOME_LABEL[calendarOutcome]}
            </Text>
          )
        : null}
    </View>
  );
}

type EventDetailViewProps = {
  event: ClubEvent | undefined;
  isLoading?: boolean;
  /**
   * Set when the upcoming/past queries backing this screen have both settled
   * with an error and no cached event was found -- distinguishes a cold-start
   * offline failure (push tap, no snapshot yet) from a genuinely missing event.
   */
  isError?: boolean;
  onToggleRsvp?: (going: boolean) => void;
  rsvpPending?: boolean;
  /**
   * Set when the most recent RSVP attempt was rejected because the event is
   * full -- overrides the (possibly stale, rolled-back) cached rsvp.full.
   */
  rsvpFullError?: boolean;
  onAddToCalendar?: () => void;
  calendarPending?: boolean;
  calendarOutcome?: AddToCalendarOutcome | null;
};

/**
 * Rendered whenever there's no event to show yet -- while still loading, when
 * the backing queries errored out (e.g. cold-start offline via a push tap,
 * nothing cached), or once queries settle successfully without a match.
 */
function EventUnresolvedState({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  if (isLoading) {
    return (
      <View testID="event-detail-loading" className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 font-sans text-sm text-ink-variant">Loading event…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View testID="event-detail-error" className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center font-sans text-base text-ink-variant">
          Couldn't load this event — check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View testID="event-detail-unavailable" className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-center font-sans text-base text-ink-variant">
        This event is no longer available.
      </Text>
    </View>
  );
}

export function EventDetailView({
  event,
  isLoading = false,
  isError = false,
  onToggleRsvp,
  rsvpPending = false,
  rsvpFullError = false,
  onAddToCalendar,
  calendarPending = false,
  calendarOutcome = null,
}: EventDetailViewProps) {
  if (!event) {
    return <EventUnresolvedState isLoading={isLoading} isError={isError} />;
  }

  const date = formatEventDate(event.startsAt);
  const hydratedDoc = hydrateCircleDoc({
    body: event.tiptapDoc,
    sgids_to_object_map: event.embeds,
    inline_attachments: event.inlineAttachments,
  });
  const hasNativeBody = circleDocHasContent(hydratedDoc);
  const countLabel = event.rsvp.limit
    ? `${event.rsvp.count} of ${event.rsvp.limit} going`
    : `${event.rsvp.count} going`;
  const showFull = !event.rsvp.going && (event.rsvp.full || rsvpFullError);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      <EventCover event={event} />
      <View className="gap-3 px-5 pt-5">
        <Text className="font-sans text-3xl font-semibold text-ink">{event.title}</Text>
        {date
          ? (
              <Text className="font-mono text-xs tracking-wider text-label uppercase">
                {date}
              </Text>
            )
          : null}
        <EventLocationLine event={event} />
        <Text className="font-sans text-sm text-ink-variant">{countLabel}</Text>

        <RsvpButton
          event={event}
          onToggleRsvp={onToggleRsvp}
          rsvpPending={rsvpPending}
          showFull={showFull}
        />
        {showFull
          ? (
              <Text className="font-sans text-xs text-ink-muted">This event is full.</Text>
            )
          : null}

        {event.startsAt
          ? (
              <AddToCalendarButton
                onAddToCalendar={onAddToCalendar}
                calendarPending={calendarPending}
                calendarOutcome={calendarOutcome}
              />
            )
          : null}

        <View className="mt-4">
          {hasNativeBody
            ? (
                <CircleTiptapRenderer
                  doc={hydratedDoc}
                  onOpenUrl={url => void Linking.openURL(url)}
                />
              )
            : event.bodyText
              ? (
                  <Text className="font-sans text-base/6 text-ink">
                    {event.bodyText}
                  </Text>
                )
              : null}
        </View>
      </View>
    </ScrollView>
  );
}

function SignedInEventDetail({
  memberId,
  eventId,
}: {
  memberId: string;
  eventId: string;
}) {
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId }),
    [memberId],
  );
  const upcoming = useEvents(scope, 'upcoming');
  const past = useEvents(scope, 'past');
  const event = findEventById([upcoming.data, past.data], eventId);
  const isLoading = (upcoming.isLoading || past.isLoading) && !event;
  const isError = (upcoming.isError || past.isError) && !event;

  const rsvp = useEventRsvp(scope);
  const [rsvpFullError, setRsvpFullError] = React.useState(false);
  const [calendarPending, setCalendarPending] = React.useState(false);
  const [calendarOutcome, setCalendarOutcome] = React.useState<AddToCalendarOutcome | null>(null);

  const handleToggleRsvp = (going: boolean) => {
    if (!event)
      return;
    setRsvpFullError(false);
    rsvp.mutate(
      { eventId: event.id, going },
      {
        onError: (error: unknown) => {
          if (error instanceof RsvpError && error.reason === 'event_full') {
            setRsvpFullError(true);
          }
        },
      },
    );
  };

  const handleAddToCalendar = () => {
    if (!event)
      return;
    setCalendarPending(true);
    addEventToDeviceCalendar(event)
      .then(setCalendarOutcome)
      .finally(() => setCalendarPending(false));
  };

  return (
    <EventDetailView
      event={event}
      isLoading={isLoading}
      isError={isError}
      onToggleRsvp={handleToggleRsvp}
      rsvpPending={rsvp.isPending}
      rsvpFullError={rsvpFullError}
      onAddToCalendar={handleAddToCalendar}
      calendarPending={calendarPending}
      calendarOutcome={calendarOutcome}
    />
  );
}

export function EventDetailScreen() {
  const member = useAuthStore.use.user();
  const params = useLocalSearchParams<{ 'event-id'?: string }>();
  const eventId = params['event-id'];

  if (!member || typeof eventId !== 'string') {
    return <EventDetailView event={undefined} />;
  }

  return <SignedInEventDetail memberId={member.id} eventId={eventId} />;
}
