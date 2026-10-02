/* eslint-disable react/no-unnecessary-use-prefix -- jest mock factories mirror real hook names */
import type { ClubEvent } from '@/features/events/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { clubEvent } from '@/features/events/test-fixtures';

import { EventsScreen } from './events-screen';

const mockPush = jest.fn();
const mockRsvpMutate = jest.fn();
const mockToggle = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});

jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 70 }));
jest.mock('@/components/ui/tab-bar-layout', () => ({ useTabBarContentPadding: () => 120 }));

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: { use: { user: () => ({ id: 'member-1', email: 'jane@example.com', name: 'Jane' }) } },
}));

jest.mock('@/features/events/api/use-event-rsvp', () => ({
  useEventRsvp: () => ({ mutate: mockRsvpMutate, isPending: false }),
}));

jest.mock('@/features/events/lib/event-reminders', () => ({
  useEventReminder: () => ({ on: false, pending: false, toggle: mockToggle }),
}));

let mockQueries: Record<string, unknown>;
jest.mock('@/features/events/api/use-events', () => ({
  useEvents: (_scope: unknown, eventScope: string) => mockQueries[eventScope],
}));

const ok = (events: ClubEvent[]) => ({ data: { ok: true, configured: true, events }, isLoading: false, isError: false, refetch: jest.fn() });

// Fix "now" so the default month is deterministic.
const NOW = new Date(2030, 8, 2);

describe('eventsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick', 'setImmediate'] });
    mockQueries = {
      upcoming: ok([clubEvent()]),
      past: ok([clubEvent({ id: 'event-2', title: 'Summer Brunch', startsAt: '2030-08-10T10:00:00.000Z' })]),
    };
  });
  afterEach(() => jest.useRealTimers());

  it('renders the title, calendar, upcoming card and a past section without buttons', () => {
    render(<EventsScreen />);
    expect(screen.getByText('Events')).toBeOnTheScreen();
    expect(screen.getByTestId('month-calendar-title')).toHaveTextContent('September 2030');
    expect(screen.getByText('Autumn Race Day')).toBeOnTheScreen();
    expect(screen.getByText('Past events')).toBeOnTheScreen();
    expect(screen.getByText('Summer Brunch')).toBeOnTheScreen();
    expect(screen.queryByTestId('event-card-event-2-rsvp')).toBeNull();
  });

  it('hides the type filter until events carry a type', () => {
    render(<EventsScreen />);
    expect(screen.queryByTestId('events-type-filter')).toBeNull();
  });

  it('shows and applies the type filter once types exist', () => {
    mockQueries = {
      upcoming: ok([
        clubEvent({ type: 'Race Day' }),
        clubEvent({ id: 'event-3', title: 'Yard morning', type: 'Stable Visit' }),
      ]),
      past: ok([]),
    };
    render(<EventsScreen />);
    expect(screen.getByTestId('events-type-filter')).toBeOnTheScreen();
    expect(screen.getByText('Yard morning')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('events-type-filter-Race Day'));
    expect(screen.queryByText('Yard morning')).toBeNull();
    expect(screen.getByText('Autumn Race Day')).toBeOnTheScreen();
  });

  it('pages months', () => {
    render(<EventsScreen />);
    fireEvent.press(screen.getByTestId('month-calendar-next'));
    expect(screen.getByTestId('month-calendar-title')).toHaveTextContent('October 2030');
    fireEvent.press(screen.getByTestId('month-calendar-prev'));
    fireEvent.press(screen.getByTestId('month-calendar-prev'));
    expect(screen.getByTestId('month-calendar-title')).toHaveTextContent('August 2030');
  });

  it('shows "Nothing on this day" for an empty day, clearing it on a day with events', () => {
    render(<EventsScreen />);
    fireEvent.press(screen.getByTestId('month-calendar-day-2030-09-10'));
    expect(screen.getByText('Nothing on this day')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('month-calendar-day-2030-09-05'));
    expect(screen.queryByText('Nothing on this day')).toBeNull();
  });

  it('shows the empty state (and still the calendar) with no events', () => {
    mockQueries = { upcoming: ok([]), past: ok([]) };
    render(<EventsScreen />);
    expect(screen.getByText('Nothing on the calendar yet')).toBeOnTheScreen();
    expect(screen.getByTestId('month-calendar')).toBeOnTheScreen();
  });

  it('shows an error state with retry when both queries failed with no snapshot', () => {
    const refetch = jest.fn();
    const failed = { data: undefined, isLoading: false, isError: true, refetch };
    mockQueries = { upcoming: failed, past: failed };
    render(<EventsScreen />);
    expect(screen.getByTestId('events-unavailable')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('events-unavailable-action'));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a loading state on first fetch', () => {
    const loading = { data: undefined, isLoading: true, isError: false, refetch: jest.fn() };
    mockQueries = { upcoming: loading, past: loading };
    render(<EventsScreen />);
    expect(screen.getByTestId('events-loading')).toBeOnTheScreen();
    expect(screen.queryByTestId('events-empty')).toBeNull();
  });

  it('rSVPs and toggles the reminder from the card, and opens detail on tap', () => {
    render(<EventsScreen />);
    fireEvent.press(screen.getByTestId('event-card-event-1-rsvp'));
    expect(mockRsvpMutate).toHaveBeenCalledWith({ eventId: 'event-1', going: true });
    fireEvent.press(screen.getByTestId('event-card-event-1-remind'));
    expect(mockToggle).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText('Autumn Race Day'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/event/[event-id]', params: { 'event-id': 'event-1' } });
  });
});
