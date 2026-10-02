import type { TileSpec } from '@/components/brand/pattern';
import type { AddToCalendarOutcome } from '@/features/events/lib/add-to-calendar';
import type { ReminderOutcome } from '@/features/events/lib/event-reminders';
import type { ClubEvent } from '@/features/events/types';

import Env from 'env';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Linking, Share, StyleSheet, Switch } from 'react-native';

import { PatternFill } from '@/components/brand/pattern';
import {
  ActivityIndicator,
  Button,
  Card,
  FocusAwareStatusBar,
  Gradient,
  Image,
  MonoLabel,
  Pressable,
  ScreenBackground,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { CaretRightV2 } from '@/components/ui/icons/v2';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { RsvpError, useEventRsvp } from '@/features/events/api/use-event-rsvp';
import { findEventById, useEvents } from '@/features/events/api/use-events';
import { addEventToDeviceCalendar } from '@/features/events/lib/add-to-calendar';
import { rsvpButtonState } from '@/features/events/lib/calendar-grid';
import { useEventReminder } from '@/features/events/lib/event-reminders';
import { formatEventDateLine } from '@/features/events/lib/format-event-date';
import { CircleTiptapRenderer } from '@/features/member-content/components/circle-tiptap-renderer';
import { hydrateCircleDoc } from '@/features/member-content/tiptap/hydrate';
import { circleDocHasContent } from '@/features/member-content/tiptap/native-support';
import { translate } from '@/lib/i18n';
import { openExternalLink } from '@/lib/open-external-link';

const CALENDAR_OUTCOME_KEY = {
  added: 'events.detail.calendarAdded',
  denied: 'events.detail.calendarDenied',
  failed: 'events.detail.calendarFailed',
} as const;

const REMINDER_NOTICE_KEY = {
  'denied': 'events.detail.reminderDenied',
  'too-late': 'events.detail.reminderTooLate',
  'failed': 'events.detail.reminderFailed',
} as const;

const BACK_ICON_STYLE = { transform: [{ rotate: '180deg' }] };
const HEADER_OVERLAY = { backgroundColor: colors.plumMid, opacity: 0.6 };
const PLUM_PATTERN: TileSpec = { kind: 'harlequin', colourway: 'plum', turn: 0 };

/**
 * Header band (not a photo hero): plum pattern + plumMid @60% under the status
 * bar, or the cover photo with a navy scrim when one exists.
 */
function HeaderBand({
  event,
  onBack,
  onShare,
}: {
  event: ClubEvent;
  onBack?: () => void;
  onShare?: () => void;
}) {
  const topPadding = useScreenTopPadding(0);
  const dateLine = formatEventDateLine(event.startsAt);
  const subtitle = [dateLine, event.inPersonLocation].filter(Boolean).join(' · ');

  return (
    <View testID="event-detail-header" className="overflow-hidden bg-plum" style={{ paddingTop: topPadding }}>
      {event.coverImageUrl
        ? (
            <>
              <Image
                testID="event-detail-cover"
                source={{ uri: event.coverImageUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="memory-disk"
                fallback={{ colourway: 'plum' }}
                accessibilityLabel={event.title}
              />
              <Gradient variant="photo-scrim" pointerEvents="none" style={StyleSheet.absoluteFill} />
            </>
          )
        : (
            <>
              <View testID="event-detail-pattern" pointerEvents="none" style={StyleSheet.absoluteFill}>
                <PatternFill spec={PLUM_PATTERN} tileSize={44} style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, HEADER_OVERLAY]} />
              </View>
            </>
          )}
      <View className="min-h-[210px] justify-between px-4 pb-6">
        <View className="h-11 flex-row items-center justify-between">
          <Pressable
            testID="event-detail-back"
            accessibilityRole="button"
            accessibilityLabel={translate('common.back')}
            onPress={onBack}
            className="-ml-3 h-11 flex-row items-center pr-3"
          >
            <View className="size-11 items-center justify-center">
              <CaretRightV2 size={20} color={colors.white} style={BACK_ICON_STYLE} />
            </View>
            <Text variant="body" className="-ml-2 text-white">{translate('events.detail.back')}</Text>
          </Pressable>
          {event.url
            ? (
                <Pressable
                  testID="event-detail-share"
                  accessibilityRole="button"
                  accessibilityLabel={translate('events.detail.share')}
                  onPress={onShare}
                  className="h-11 justify-center"
                >
                  <MonoLabel tone="white">{translate('events.detail.share')}</MonoLabel>
                </Pressable>
              )
            : null}
        </View>
        <View className="mt-6 gap-2">
          <Text variant="display-lg" accessibilityRole="header" className="text-white">{event.title}</Text>
          {subtitle ? <Text variant="body" className="text-white/85">{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

function EventLocationLink({ event }: { event: ClubEvent }) {
  if (event.inPersonLocation || !event.virtualLocationUrl)
    return null;
  return (
    <Pressable
      testID="event-location-link"
      accessibilityRole="link"
      onPress={() => openExternalLink(event.virtualLocationUrl!)}
    >
      <Text variant="body-lg" className="font-sans-semibold underline">
        {translate('events.detail.joinOnline')}
      </Text>
    </Pressable>
  );
}

function DetailRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View
      className={`min-h-11 flex-row items-center justify-between py-3 ${divider ? 'border-b border-outline-variant' : ''}`}
    >
      <MonoLabel>{label}</MonoLabel>
      <Text variant="body-lg" className="text-ink-variant">{value}</Text>
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
  onBack?: () => void;
  onShare?: () => void;
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
  reminderOn?: boolean;
  onToggleReminder?: () => void;
  reminderNotice?: ReminderOutcome | null;
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
        <Text variant="body" className="mt-3 text-ink-variant">{translate('events.detail.loading')}</Text>
      </View>
    );
  }

  return (
    <View
      testID={isError ? 'event-detail-error' : 'event-detail-unavailable'}
      className="flex-1 items-center justify-center bg-surface px-8"
    >
      <Text variant="body-lg" className="text-center text-ink-variant">
        {translate(isError ? 'events.detail.loadError' : 'events.detail.unavailable')}
      </Text>
    </View>
  );
}

type RemindCardProps = Pick<
  EventDetailViewProps,
  'reminderOn' | 'onToggleReminder' | 'reminderNotice' | 'onAddToCalendar' | 'calendarPending' | 'calendarOutcome'
> & { event: ClubEvent };

function RemindCard({
  event,
  reminderOn = false,
  onToggleReminder,
  reminderNotice = null,
  onAddToCalendar,
  calendarPending = false,
  calendarOutcome = null,
}: RemindCardProps) {
  return (
    <Card testID="event-remind-card" className="gap-2">
      <View className="min-h-11 flex-row items-center justify-between">
        <Text variant="body-lg">{translate('events.detail.remindMe')}</Text>
        <Switch
          testID="event-remind-switch"
          accessibilityLabel={translate('events.detail.remindMe')}
          value={reminderOn}
          onValueChange={() => onToggleReminder?.()}
          trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>
      {reminderNotice && reminderNotice !== 'scheduled' && reminderNotice !== 'cancelled'
        ? (
            <Text testID="event-remind-notice" variant="body-sm" className="text-ink-variant">
              {translate(REMINDER_NOTICE_KEY[reminderNotice])}
            </Text>
          )
        : null}
      {reminderOn && event.startsAt
        ? (
            <View className="gap-1">
              <Button
                testID="event-add-to-calendar"
                size="md"
                variant="secondary"
                fullWidth={false}
                className="self-start"
                label={calendarPending ? translate('events.detail.addingToCalendar') : translate('events.detail.addToCalendar')}
                disabled={calendarPending}
                onPress={onAddToCalendar}
              />
              {calendarOutcome
                ? (
                    <Text testID="event-add-to-calendar-outcome" variant="body-sm" className="text-ink-variant">
                      {translate(CALENDAR_OUTCOME_KEY[calendarOutcome])}
                    </Text>
                  )
                : null}
            </View>
          )
        : null}
    </Card>
  );
}

export function EventDetailView({
  event,
  isLoading = false,
  isError = false,
  onBack,
  onShare,
  onToggleRsvp,
  rsvpPending = false,
  rsvpFullError = false,
  onAddToCalendar,
  calendarPending = false,
  calendarOutcome = null,
  reminderOn = false,
  onToggleReminder,
  reminderNotice = null,
}: EventDetailViewProps) {
  if (!event) {
    return <EventUnresolvedState isLoading={isLoading} isError={isError} />;
  }

  const hydratedDoc = hydrateCircleDoc({
    body: event.tiptapDoc,
    sgids_to_object_map: event.embeds,
    inline_attachments: event.inlineAttachments,
  });
  const hasNativeBody = circleDocHasContent(hydratedDoc);
  const { limit, count } = event.rsvp;
  const state = rsvpButtonState(event, rsvpFullError);
  const showSpots = typeof limit === 'number' && limit > 0;

  return (
    <View className="flex-1 bg-background">
      <ScreenBackground />
      <FocusAwareStatusBar barStyle="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <HeaderBand event={event} onBack={onBack} onShare={onShare} />
        <View className="gap-3 px-4 pt-4">
          <Card testID="event-detail-card" className="gap-3">
            {event.type ? <MonoLabel testID="event-detail-type">{event.type}</MonoLabel> : null}
            {hasNativeBody
              ? (
                  <CircleTiptapRenderer
                    doc={hydratedDoc}
                    onOpenUrl={url => void Linking.openURL(url)}
                  />
                )
              : event.bodyText
                ? <Text variant="body-lg" className="text-ink-variant">{event.bodyText}</Text>
                : null}
            <EventLocationLink event={event} />
            <View>
              {showSpots
                ? (
                    <DetailRow
                      divider
                      label={translate('events.detail.spotsRemaining')}
                      value={translate('events.detail.spotsValue', { left: Math.max(0, limit - count), limit })}
                    />
                  )
                : null}
              <DetailRow
                label={translate('events.detail.attending')}
                value={translate('events.detail.attendingValue', { count })}
              />
            </View>
          </Card>

          {state !== 'hidden'
            ? (
                <Button
                  testID="event-rsvp-cta"
                  size="lg"
                  variant="primary"
                  label={
                    state === 'going'
                      ? translate('events.detail.cancelRsvp')
                      : state === 'full' ? translate('events.detail.eventFull') : translate('events.detail.rsvpGoing')
                  }
                  disabled={state === 'full'}
                  loading={rsvpPending}
                  onPress={() => onToggleRsvp?.(state !== 'going')}
                />
              )
            : null}

          <RemindCard
            event={event}
            reminderOn={reminderOn}
            onToggleReminder={onToggleReminder}
            reminderNotice={reminderNotice}
            onAddToCalendar={onAddToCalendar}
            calendarPending={calendarPending}
            calendarOutcome={calendarOutcome}
          />
        </View>
      </ScrollView>
    </View>
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
  const router = useRouter();
  const reminder = useEventReminder(event);
  const [reminderNotice, setReminderNotice] = React.useState<ReminderOutcome | null>(null);

  const handleToggleReminder = () => {
    void reminder.toggle().then(setReminderNotice);
  };

  const handleShare = () => {
    if (!event?.url)
      return;
    void Share.share({ message: event.title, url: event.url }).catch(() => {});
  };

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
      onBack={() => router.back()}
      onShare={handleShare}
      reminderOn={reminder.on}
      onToggleReminder={handleToggleReminder}
      reminderNotice={reminderNotice}
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {!member || typeof eventId !== 'string'
        ? <EventDetailView event={undefined} />
        : <SignedInEventDetail memberId={member.id} eventId={eventId} />}
    </>
  );
}
