/* eslint-disable react/no-unnecessary-use-prefix -- jest mock factories mirror real hook names */
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { EventDetailScreen, EventDetailView } from '@/features/events/screens/event-detail-screen';

import { clubEvent, rsvp } from '@/features/events/test-fixtures';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image' };
});

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

const mockAddEventToDeviceCalendar = jest.fn();

jest.mock('@/features/events/lib/add-to-calendar', () => ({
  addEventToDeviceCalendar: (...args: unknown[]) => mockAddEventToDeviceCalendar(...args),
}));

jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 44 }));
jest.mock('@/components/ui/focus-aware-status-bar', () => ({ FocusAwareStatusBar: () => null }));

describe('eventDetailView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the header band, details card and spots/attending rows', () => {
    render(<EventDetailView event={clubEvent({ type: 'Race Day', rsvp: rsvp({ count: 37, limit: 40 }) })} />);
    expect(screen.getByText('Autumn Race Day')).toBeOnTheScreen();
    expect(screen.getByText(/Thu 5 September · \d{2}:\d{2} · The Curragh/)).toBeOnTheScreen();
    expect(screen.getByTestId('event-detail-pattern')).toBeOnTheScreen();
    expect(screen.getByTestId('event-detail-type')).toHaveTextContent('Race Day');
    expect(screen.getByText('Join us for a day at the races.')).toBeOnTheScreen();
    expect(screen.getByText('3 of 40')).toBeOnTheScreen();
    expect(screen.getByText('37 going')).toBeOnTheScreen();
  });

  it('hides the type label until the event has a type, and the spots row without a limit', () => {
    render(<EventDetailView event={clubEvent()} />);
    expect(screen.queryByTestId('event-detail-type')).toBeNull();
    expect(screen.queryByText('Spots remaining')).toBeNull();
    expect(screen.getByText('12 going')).toBeOnTheScreen();
  });

  it('uses the cover photo instead of the pattern when present', () => {
    render(<EventDetailView event={clubEvent({ coverImageUrl: 'https://example.com/c.jpg' })} />);
    expect(screen.getByTestId('event-detail-cover')).toBeOnTheScreen();
    expect(screen.queryByTestId('event-detail-pattern')).toBeNull();
  });

  it('renders hydrated TipTap content natively when available', () => {
    render(
      <EventDetailView
        event={clubEvent({
          bodyText: 'Plain text fallback',
          tiptapDoc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Native race day content' }] }] },
        })}
      />,
    );
    expect(screen.getByText('Native race day content')).toBeOnTheScreen();
    expect(screen.queryByText('Plain text fallback')).toBeNull();
  });

  it('renders a "Join online" link for virtual events', () => {
    render(<EventDetailView event={clubEvent({ locationType: 'virtual', inPersonLocation: null, virtualLocationUrl: 'https://example.com/live' })} />);
    expect(screen.getByText('Join online')).toBeOnTheScreen();
  });

  it('shows SHARE only with a url and calls onShare', () => {
    const onShare = jest.fn();
    const { rerender } = render(<EventDetailView event={clubEvent()} onShare={onShare} />);
    expect(screen.queryByTestId('event-detail-share')).toBeNull();
    rerender(<EventDetailView event={clubEvent({ url: 'https://circle.example/e/1' })} onShare={onShare} />);
    fireEvent.press(screen.getByTestId('event-detail-share'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('shows loading / error / unavailable states', () => {
    const { rerender } = render(<EventDetailView event={undefined} isLoading />);
    expect(screen.getByTestId('event-detail-loading')).toBeOnTheScreen();
    rerender(<EventDetailView event={undefined} isError />);
    expect(screen.getByText('Couldn\'t load this event — check your connection and try again.')).toBeOnTheScreen();
    rerender(<EventDetailView event={undefined} />);
    expect(screen.getByText('This event is no longer available.')).toBeOnTheScreen();
  });
});

describe('eventDetailView rsvp button', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rSVP – I am going calls onToggleRsvp(true)', () => {
    const onToggleRsvp = jest.fn();
    render(<EventDetailView event={clubEvent()} onToggleRsvp={onToggleRsvp} />);
    fireEvent.press(screen.getByText('RSVP – I am going'));
    expect(onToggleRsvp).toHaveBeenCalledWith(true);
  });

  it('cancel RSVP when already going', () => {
    const onToggleRsvp = jest.fn();
    render(<EventDetailView event={clubEvent({ rsvp: rsvp({ going: true }) })} onToggleRsvp={onToggleRsvp} />);
    fireEvent.press(screen.getByText('Cancel RSVP'));
    expect(onToggleRsvp).toHaveBeenCalledWith(false);
  });

  it('disabled "Event full" when full and not going; no waitlist button', () => {
    const onToggleRsvp = jest.fn();
    render(<EventDetailView event={clubEvent({ rsvp: rsvp({ full: true, count: 20, limit: 20 }) })} onToggleRsvp={onToggleRsvp} />);
    expect(screen.getByTestId('event-rsvp-cta')).toBeDisabled();
    fireEvent.press(screen.getByText('Event full'));
    expect(onToggleRsvp).not.toHaveBeenCalled();
    expect(screen.queryByText('Join Waitlist')).toBeNull();
  });

  it('full but already going: still Cancel RSVP (enabled)', () => {
    render(<EventDetailView event={clubEvent({ rsvp: rsvp({ full: true, going: true, count: 20, limit: 20 }) })} />);
    expect(screen.getByText('Cancel RSVP')).toBeOnTheScreen();
    expect(screen.getByTestId('event-rsvp-cta')).not.toBeDisabled();
  });

  it('rsvpFullError forces the full state', () => {
    render(<EventDetailView event={clubEvent()} rsvpFullError />);
    expect(screen.getByText('Event full')).toBeOnTheScreen();
  });

  it('hides the control when rsvp is disabled', () => {
    render(<EventDetailView event={clubEvent({ rsvp: rsvp({ disabled: true }) })} />);
    expect(screen.queryByTestId('event-rsvp-cta')).toBeNull();
  });
});

describe('eventDetailView remind me', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reflects reminder state and calls onToggleReminder', () => {
    const onToggleReminder = jest.fn();
    render(<EventDetailView event={clubEvent()} reminderOn onToggleReminder={onToggleReminder} />);
    expect(screen.getByTestId('event-remind-switch').props.value).toBe(true);
    fireEvent(screen.getByTestId('event-remind-switch'), 'valueChange', false);
    expect(onToggleReminder).toHaveBeenCalledTimes(1);
  });

  it('offers Add to calendar only while the reminder is on and the event has a start', () => {
    const onAddToCalendar = jest.fn();
    const { rerender } = render(<EventDetailView event={clubEvent()} />);
    expect(screen.queryByTestId('event-add-to-calendar')).toBeNull();
    rerender(<EventDetailView event={clubEvent()} reminderOn onAddToCalendar={onAddToCalendar} />);
    fireEvent.press(screen.getByTestId('event-add-to-calendar'));
    expect(onAddToCalendar).toHaveBeenCalledTimes(1);
    rerender(<EventDetailView event={clubEvent({ startsAt: null })} reminderOn />);
    expect(screen.queryByTestId('event-add-to-calendar')).toBeNull();
  });

  it.each([
    ['added', 'Added to your calendar ✓'],
    ['denied', 'Calendar permission denied'],
    ['failed', 'Couldn\'t add to calendar'],
  ] as const)('shows the "%s" calendar outcome', (outcome, label) => {
    render(<EventDetailView event={clubEvent()} reminderOn calendarOutcome={outcome} />);
    expect(screen.getByText(label)).toBeOnTheScreen();
  });

  it('explains why a reminder could not be set', () => {
    render(<EventDetailView event={clubEvent()} reminderNotice="denied" />);
    expect(screen.getByText('Allow notifications in Settings to get reminders.')).toBeOnTheScreen();
  });
});

const mockUseEvents = jest.fn();
const mockRsvpMutate = jest.fn();

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ back: mockBack }),
  Stack: { Screen: () => null },
}));

const mockReminderToggle = jest.fn();
jest.mock('@/features/events/lib/event-reminders', () => ({
  useEventReminder: () => ({ on: false, pending: false, toggle: mockReminderToggle }),
}));
const mockUseLocalSearchParams = jest.fn();

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: {
    use: {
      user: () => mockUseAuthUser(),
    },
  },
}));
const mockUseAuthUser = jest.fn();

jest.mock('@/features/events/api/use-events', () => {
  const actual = jest.requireActual('@/features/events/api/use-events');
  return {
    ...actual,
    useEvents: (_scope: unknown, eventScope: 'upcoming' | 'past') => mockUseEvents(eventScope),
  };
});

jest.mock('@/features/events/api/use-event-rsvp', () => {
  const actual = jest.requireActual('@/features/events/api/use-event-rsvp');
  return {
    ...actual,
    useEventRsvp: () => ({ mutate: mockRsvpMutate, isPending: false }),
  };
});

describe('eventDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthUser.mockReturnValue({ id: 'member-1', email: 'jane@example.com', name: 'Jane Member' });
    mockUseLocalSearchParams.mockReturnValue({ 'event-id': 'event-1' });
    mockUseEvents.mockImplementation((eventScope: 'upcoming' | 'past') => ({
      data: {
        ok: true,
        configured: true,
        events: eventScope === 'upcoming' ? [clubEvent()] : [clubEvent({ id: 'event-2', title: 'Summer Brunch' })],
      },
      isLoading: false,
    }));
  });

  it('finds the event across the upcoming and past scopes and renders it', () => {
    mockUseLocalSearchParams.mockReturnValue({ 'event-id': 'event-2' });
    render(<EventDetailScreen />);
    expect(screen.getByText('Summer Brunch')).toBeOnTheScreen();
  });

  it('shows the fallback when the event id matches nothing in either scope', () => {
    mockUseLocalSearchParams.mockReturnValue({ 'event-id': 'unknown-event' });
    render(<EventDetailScreen />);
    expect(screen.getByText('This event is no longer available.')).toBeOnTheScreen();
  });

  it('shows a connection-problem message instead of the unavailable fallback on a cold-start offline open (both queries errored, nothing cached)', () => {
    mockUseLocalSearchParams.mockReturnValue({ 'event-id': 'event-1' });
    mockUseEvents.mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isError: true,
    }));

    render(<EventDetailScreen />);

    expect(screen.getByTestId('event-detail-error')).toBeOnTheScreen();
    expect(
      screen.getByText('Couldn\'t load this event — check your connection and try again.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('This event is no longer available.')).toBeNull();
  });

  it('calls the RSVP mutation with the event id when the RSVP button is pressed', () => {
    render(<EventDetailScreen />);
    fireEvent.press(screen.getByTestId('event-rsvp-cta'));
    expect(mockRsvpMutate).toHaveBeenCalledWith(
      { eventId: 'event-1', going: true },
      expect.anything(),
    );
  });

  it('shows the full state when the RSVP mutation rejects with reason "event_full"', async () => {
    const { RsvpError } = jest.requireActual('@/features/events/api/use-event-rsvp');
    mockRsvpMutate.mockImplementation((_vars, options) => {
      options?.onError?.(new RsvpError('event_full'));
    });

    render(<EventDetailScreen />);
    fireEvent.press(screen.getByTestId('event-rsvp-cta'));

    expect(await screen.findByText('Event full')).toBeOnTheScreen();
  });

  it('toggles the shared reminder from the switch and shows a notice when it cannot be set', async () => {
    mockReminderToggle.mockResolvedValue('too-late');
    render(<EventDetailScreen />);
    fireEvent(screen.getByTestId('event-remind-switch'), 'valueChange', true);
    expect(mockReminderToggle).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('event-remind-notice')).toBeOnTheScreen();
  });

  it('goes back from the header', () => {
    render(<EventDetailScreen />);
    fireEvent.press(screen.getByTestId('event-detail-back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('surfaces the add-to-calendar outcome once the native call resolves', async () => {
    mockAddEventToDeviceCalendar.mockResolvedValue('added');
    jest.requireMock('@/features/events/lib/event-reminders').useEventReminder = () => ({ on: true, pending: false, toggle: mockReminderToggle });
    render(<EventDetailScreen />);

    fireEvent.press(screen.getByTestId('event-add-to-calendar'));

    expect(await screen.findByText('Added to your calendar ✓')).toBeOnTheScreen();
    expect(mockAddEventToDeviceCalendar).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1' }));
  });
});
