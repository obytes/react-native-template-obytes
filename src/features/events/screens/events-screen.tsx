import type { MonthRef } from '@/features/events/lib/calendar-grid';
import type { ClubEvent } from '@/features/events/types';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  ActivityIndicator,
  ChipRow,
  EmptyState,
  ErrorState,
  FocusAwareStatusBar,
  MonoLabel,
  ScreenBackground,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { showErrorMessage } from '@/components/ui/utils';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useEventRsvp } from '@/features/events/api/use-event-rsvp';
import { useEvents } from '@/features/events/api/use-events';
import { EventCard } from '@/features/events/components/event-card';
import { MonthCalendar } from '@/features/events/components/month-calendar';
import {
  groupEventsByDay,
  monthOf,
  shiftMonth,
} from '@/features/events/lib/calendar-grid';
import { useEventReminder } from '@/features/events/lib/event-reminders';
import { eventDayColour } from '@/features/events/lib/event-type';
import { translate } from '@/lib/i18n';

const ALL = 'all';

// Same copy as the detail screen's inline notice.
const REMINDER_NOTICE_KEY = {
  'denied': 'events.detail.reminderDenied',
  'too-late': 'events.detail.reminderTooLate',
  'failed': 'events.detail.reminderFailed',
} as const;

function byStart(a: ClubEvent, b: ClubEvent) {
  return (Date.parse(a.startsAt ?? '') || 0) - (Date.parse(b.startsAt ?? '') || 0);
}

function ConnectedEventCard({
  event,
  past,
  onOpen,
  onToggleRsvp,
  rsvpPending,
}: {
  event: ClubEvent;
  past: boolean;
  onOpen: () => void;
  onToggleRsvp: (eventId: string, going: boolean) => void;
  rsvpPending: boolean;
}) {
  const reminder = useEventReminder(event);
  return (
    <EventCard
      event={event}
      past={past}
      onPress={onOpen}
      rsvpPending={rsvpPending}
      onToggleRsvp={going => onToggleRsvp(event.id, going)}
      reminderOn={reminder.on}
      onToggleReminder={() => {
        void reminder.toggle().then((outcome) => {
          if (outcome in REMINDER_NOTICE_KEY)
            showErrorMessage(translate(REMINDER_NOTICE_KEY[outcome as keyof typeof REMINDER_NOTICE_KEY]));
        });
      }}
    />
  );
}

function useEventsModel(
  upcomingAll: ClubEvent[] | undefined,
  pastAll: ClubEvent[] | undefined,
  typeFilter: string,
) {
  // Type filter chips: one per type present. Hidden until S13-11 ships `type`.
  const typeChips = React.useMemo(() => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const event of [...(upcomingAll ?? []), ...(pastAll ?? [])]) {
      total += 1;
      if (event.type)
        counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
    }
    if (counts.size === 0)
      return [];
    return [
      { key: ALL, label: translate('events.all'), count: total },
      ...[...counts.entries()].map(([key, count]) => ({ key, label: key, count })),
    ];
  }, [upcomingAll, pastAll]);

  const matches = React.useCallback(
    (event: ClubEvent) => typeFilter === ALL || event.type === typeFilter,
    [typeFilter],
  );
  const upcoming = React.useMemo(() => (upcomingAll ?? []).filter(matches).sort(byStart), [upcomingAll, matches]);
  const past = React.useMemo(() => (pastAll ?? []).filter(matches).sort((a, b) => byStart(b, a)), [pastAll, matches]);

  const eventDays = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const [key, list] of groupEventsByDay([...upcoming, ...past])) {
      map.set(key, eventDayColour(list[0].type));
    }
    return map;
  }, [upcoming, past]);

  return { typeChips, upcoming, past, eventDays };
}

function TrackedCard({
  onLayoutY,
  ...props
}: React.ComponentProps<typeof ConnectedEventCard> & { onLayoutY: (y: number) => void }) {
  return (
    <View onLayout={e => onLayoutY(e.nativeEvent.layout.y)}>
      <ConnectedEventCard {...props} />
    </View>
  );
}

type EventsBodyProps = {
  isLoading: boolean;
  isUnavailable: boolean;
  retrying: boolean;
  onRetry: () => void;
  month: MonthRef;
  eventDays: ReadonlyMap<string, string>;
  onMonthChange: (delta: number) => void;
  onSelectDay: (key: string) => void;
  emptyDay: string | null;
  hasEvents: boolean;
  onListLayout: (y: number) => void;
  children: React.ReactNode;
};

function EventsBody({
  isLoading,
  isUnavailable,
  retrying,
  onRetry,
  month,
  eventDays,
  onMonthChange,
  onSelectDay,
  emptyDay,
  hasEvents,
  onListLayout,
  children,
}: EventsBodyProps) {
  if (isLoading) {
    return (
      <View testID="events-loading" className="items-center py-16">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (isUnavailable) {
    return (
      <ErrorState
        testID="events-unavailable"
        title={translate('events.unavailableTitle')}
        body={translate('events.unavailableBody')}
        retrying={retrying}
        onRetry={onRetry}
      />
    );
  }
  return (
    <>
      <MonthCalendar
        month={month}
        eventDays={eventDays}
        onPrevMonth={() => onMonthChange(-1)}
        onNextMonth={() => onMonthChange(1)}
        onSelectDay={onSelectDay}
      />
      {emptyDay
        ? (
            <Text testID="events-day-empty" variant="body-sm" className="text-center text-ink-variant">
              {translate('events.nothingThisDay')}
            </Text>
          )
        : null}
      {hasEvents
        ? (
            <View className="gap-4" onLayout={e => onListLayout(e.nativeEvent.layout.y)}>
              {children}
            </View>
          )
        : (
            <EmptyState
              testID="events-empty"
              title={translate('events.emptyTitle')}
              body={translate('events.emptyBody')}
            />
          )}
    </>
  );
}

function useCalendarNavigation(events: ClubEvent[]) {
  const [month, setMonth] = React.useState(() => monthOf(new Date()));
  const [emptyDay, setEmptyDay] = React.useState<string | null>(null);
  const scrollRef = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const listY = React.useRef(0);
  const cardY = React.useRef(new Map<string, number>());

  const handleSelectDay = (key: string) => {
    const day = groupEventsByDay(events).get(key);
    const [y, m] = key.split('-').map(Number);
    setMonth({ year: y, month: m - 1 });
    if (!day?.length) {
      setEmptyDay(key);
      return;
    }
    setEmptyDay(null);
    const y0 = cardY.current.get(day[0].id);
    if (y0 !== undefined)
      scrollRef.current?.scrollTo({ y: listY.current + y0 - 12, animated: true });
  };

  const setListY = (y: number) => {
    listY.current = y;
  };
  const setCardY = (id: string, y: number) => {
    cardY.current.set(id, y);
  };

  const goToMonth = (delta: number) => {
    setEmptyDay(null);
    setMonth(current => shiftMonth(current, delta));
  };

  return { month, emptyDay, goToMonth, handleSelectDay, scrollRef, setListY, setCardY };
}

export function EventsScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();

  const memberScope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );
  const upcomingQuery = useEvents(memberScope, 'upcoming');
  const pastQuery = useEvents(memberScope, 'past');
  const rsvp = useEventRsvp(memberScope);

  const [typeFilter, setTypeFilter] = React.useState(ALL);
  const { typeChips, upcoming, past, eventDays } = useEventsModel(upcomingQuery.data?.events, pastQuery.data?.events, typeFilter);
  const upcomingAll = upcomingQuery.data?.events;
  const pastAll = pastQuery.data?.events;

  const openEvent = (id: string) =>
    router.push({ pathname: '/event/[event-id]', params: { 'event-id': id } });

  const handleToggleRsvp = (eventId: string, going: boolean) => rsvp.mutate({ eventId, going });

  const { month, emptyDay, goToMonth, handleSelectDay, scrollRef, setListY, setCardY } = useCalendarNavigation([...upcoming, ...past]);

  const isLoading = (upcomingQuery.isLoading || pastQuery.isLoading) && !upcomingAll && !pastAll;
  const isUnavailable = !upcomingAll && !pastAll && (upcomingQuery.isError || pastQuery.isError);
  const hasEvents = upcoming.length + past.length > 0;

  const renderCard = (event: ClubEvent, isPast: boolean) => (
    <TrackedCard
      key={event.id}
      event={event}
      past={isPast}
      onLayoutY={y => setCardY(event.id, y)}
      onOpen={() => openEvent(event.id)}
      onToggleRsvp={handleToggleRsvp}
      rsvpPending={rsvp.isPending && rsvp.variables?.eventId === event.id}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <ScreenBackground />
      <FocusAwareStatusBar />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
          gap: 16,
        }}
      >
        <Text variant="display-lg" accessibilityRole="header">{translate('events.title')}</Text>

        {typeChips.length > 0
          ? (
              <View className="-mx-4">
                <ChipRow
                  testID="events-type-filter"
                  items={typeChips}
                  selectedKey={typeFilter}
                  onSelect={setTypeFilter}
                  contentInset={16}
                />
              </View>
            )
          : null}

        <EventsBody
          isLoading={isLoading}
          isUnavailable={isUnavailable}
          retrying={upcomingQuery.isFetching || pastQuery.isFetching}
          onRetry={() => {
            void upcomingQuery.refetch();
            void pastQuery.refetch();
          }}
          month={month}
          eventDays={eventDays}
          onMonthChange={goToMonth}
          onSelectDay={handleSelectDay}
          emptyDay={emptyDay}
          hasEvents={hasEvents}
          onListLayout={setListY}
        >
          {upcoming.map(event => renderCard(event, false))}
          {past.length > 0
            ? (
                <View className="mt-2">
                  <MonoLabel>{translate('events.pastEvents')}</MonoLabel>
                </View>
              )
            : null}
          {past.map(event => renderCard(event, true))}
        </EventsBody>
      </ScrollView>
    </View>
  );
}
