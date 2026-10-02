import { clubEvent, rsvp } from '@/features/events/test-fixtures';
import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

import { EventCard } from './event-card';

afterEach(cleanup);

describe('eventCard', () => {
  it('renders title and the date line, with the type only when present', () => {
    const { rerender } = render(<EventCard event={clubEvent()} onPress={jest.fn()} />);
    expect(screen.getByText('Autumn Race Day')).toBeOnTheScreen();
    expect(screen.getByText(/^Thu 5 September · \d{2}:\d{2}$/)).toBeOnTheScreen();
    rerender(<EventCard event={clubEvent({ type: 'Race Day' })} onPress={jest.fn()} />);
    expect(screen.getByText(/· race day$/)).toBeOnTheScreen();
  });

  it('shows RSVP + Remind me and wires them', () => {
    const onToggleRsvp = jest.fn();
    const onToggleReminder = jest.fn();
    render(
      <EventCard event={clubEvent()} onPress={jest.fn()} onToggleRsvp={onToggleRsvp} onToggleReminder={onToggleReminder} />,
    );
    fireEvent.press(screen.getByText('RSVP'));
    fireEvent.press(screen.getByText('Remind me'));
    expect(onToggleRsvp).toHaveBeenCalledWith(true);
    expect(onToggleReminder).toHaveBeenCalledTimes(1);
  });

  it('shows "Going ✓" when RSVPd and pressing cancels', () => {
    const onToggleRsvp = jest.fn();
    render(<EventCard event={clubEvent({ rsvp: rsvp({ going: true }) })} onPress={jest.fn()} onToggleRsvp={onToggleRsvp} />);
    fireEvent.press(screen.getByText('Going ✓'));
    expect(onToggleRsvp).toHaveBeenCalledWith(false);
  });

  it('disables "Full" when full and not going', () => {
    const onToggleRsvp = jest.fn();
    render(<EventCard event={clubEvent({ rsvp: rsvp({ full: true }) })} onPress={jest.fn()} onToggleRsvp={onToggleRsvp} />);
    expect(screen.getByTestId('event-card-event-1-rsvp')).toBeDisabled();
    fireEvent.press(screen.getByText('Full'));
    expect(onToggleRsvp).not.toHaveBeenCalled();
  });

  it('keeps "Going ✓" enabled on a full event the member joined', () => {
    render(<EventCard event={clubEvent({ rsvp: rsvp({ full: true, going: true }) })} onPress={jest.fn()} />);
    expect(screen.getByTestId('event-card-event-1-rsvp')).not.toBeDisabled();
    expect(screen.getByText('Going ✓')).toBeOnTheScreen();
  });

  it('reflects the reminder state', () => {
    render(<EventCard event={clubEvent()} onPress={jest.fn()} reminderOn />);
    expect(screen.getByText('Reminder on')).toBeOnTheScreen();
  });

  it('past events have no buttons', () => {
    render(<EventCard event={clubEvent()} onPress={jest.fn()} past />);
    expect(screen.queryByText('RSVP')).toBeNull();
    expect(screen.queryByText('Remind me')).toBeNull();
  });

  it('opens the event when the card is tapped', () => {
    const onPress = jest.fn();
    render(<EventCard event={clubEvent()} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Autumn Race Day'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
