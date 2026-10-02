import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import colors from '@/components/ui/colors';

import { MonthCalendar } from './month-calendar';

const base = {
  month: { year: 2026, month: 6 },
  today: new Date(2026, 6, 2),
  onPrevMonth: jest.fn(),
  onNextMonth: jest.fn(),
  onSelectDay: jest.fn(),
};

describe('monthCalendar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the month title and a Monday-first weekday row', () => {
    render(<MonthCalendar {...base} eventDays={new Map()} />);
    expect(screen.getByTestId('month-calendar-title')).toHaveTextContent('July 2026');
    expect(screen.getByTestId('month-calendar-day-2026-06-29')).toBeOnTheScreen();
  });

  it('fills event days with the supplied colour and outlines today', () => {
    render(<MonthCalendar {...base} eventDays={new Map([['2026-07-04', colors.onPrimaryContainer]])} />);
    expect(screen.getByTestId('month-calendar-day-2026-07-04')).toHaveStyle({ backgroundColor: colors.onPrimaryContainer });
    expect(screen.getByTestId('month-calendar-day-2026-07-03')).not.toHaveStyle({ backgroundColor: colors.onPrimaryContainer });
    expect(screen.getByLabelText('2026-07-02, today')).toBeOnTheScreen();
  });

  it('pages months and reports day taps', () => {
    render(<MonthCalendar {...base} eventDays={new Map()} />);
    fireEvent.press(screen.getByTestId('month-calendar-next'));
    fireEvent.press(screen.getByTestId('month-calendar-prev'));
    fireEvent.press(screen.getByTestId('month-calendar-day-2026-07-10'));
    expect(base.onNextMonth).toHaveBeenCalledTimes(1);
    expect(base.onPrevMonth).toHaveBeenCalledTimes(1);
    expect(base.onSelectDay).toHaveBeenCalledWith('2026-07-10');
  });
});
