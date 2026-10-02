import { clubEvent, rsvp } from '@/features/events/test-fixtures';

import {
  buildMonthGrid,
  dayKey,
  eventDayKey,
  groupEventsByDay,
  monthOf,
  REMINDER_LEAD_MS,
  reminderTime,
  rsvpButtonState,
  shiftMonth,
} from './calendar-grid';

describe('buildMonthGrid', () => {
  // July 2026: 1 July is a Wednesday, 31 days.
  const today = new Date(2026, 6, 2);
  const weeks = buildMonthGrid({ year: 2026, month: 6 }, today);

  it('starts weeks on Monday with whole weeks', () => {
    expect(weeks).toHaveLength(5);
    expect(weeks.every(w => w.length === 7)).toBe(true);
    expect(weeks[0][0].key).toBe('2026-06-29');
    expect(weeks[0][2].key).toBe('2026-07-01');
    expect(weeks[4][6].key).toBe('2026-08-02');
  });

  it('flags out-of-month days', () => {
    expect(weeks[0].slice(0, 2).every(c => !c.inMonth)).toBe(true);
    expect(weeks[0][2].inMonth).toBe(true);
    expect(weeks[4][5].inMonth).toBe(false); // 1 Aug
  });

  it('marks today only once', () => {
    const todays = weeks.flat().filter(c => c.isToday);
    expect(todays.map(c => c.key)).toEqual(['2026-07-02']);
  });

  it('does not flag today in a different month', () => {
    const june = buildMonthGrid({ year: 2026, month: 5 }, today);
    // 2 July appears as trailing day in June grid? June 2026 ends Tue 30 -> trailing 1-5 July
    expect(june.flat().filter(c => c.isToday).every(c => !c.inMonth)).toBe(true);
  });

  it('handles a month starting on Monday (no leading days) and on Sunday (6 leading)', () => {
    const june2026 = buildMonthGrid({ year: 2026, month: 5 }, today); // 1 June = Monday
    expect(june2026[0][0]).toMatchObject({ key: '2026-06-01', inMonth: true });
    const feb2026 = buildMonthGrid({ year: 2026, month: 1 }, today); // 1 Feb = Sunday
    expect(feb2026[0][6]).toMatchObject({ key: '2026-02-01', inMonth: true });
    expect(feb2026[0][0]).toMatchObject({ key: '2026-01-26', inMonth: false });
  });

  it('uses 6 weeks when needed', () => {
    // March 2025: 1 March is Saturday, 31 days -> 6 weeks
    expect(buildMonthGrid({ year: 2025, month: 2 }, today)).toHaveLength(6);
  });
});

describe('month paging', () => {
  it('shifts across year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(monthOf(new Date(2026, 6, 15))).toEqual({ year: 2026, month: 6 });
  });
});

describe('event day marking', () => {
  it('buckets events by local day sorted by start', () => {
    const late = clubEvent({ id: 'b', startsAt: new Date(2026, 6, 4, 18).toISOString() });
    const early = clubEvent({ id: 'a', startsAt: new Date(2026, 6, 4, 9).toISOString() });
    const other = clubEvent({ id: 'c', startsAt: new Date(2026, 6, 19, 10).toISOString() });
    const none = clubEvent({ id: 'd', startsAt: null });
    const map = groupEventsByDay([late, other, early, none]);
    expect([...map.keys()].sort()).toEqual(['2026-07-04', '2026-07-19']);
    expect(map.get('2026-07-04')!.map(e => e.id)).toEqual(['a', 'b']);
  });

  it('dayKey / eventDayKey', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(eventDayKey(null)).toBeNull();
    expect(eventDayKey('nope')).toBeNull();
    expect(eventDayKey(new Date(2026, 6, 4, 12).toISOString())).toBe('2026-07-04');
  });
});

describe('rsvpButtonState', () => {
  it('rsvp when open', () => expect(rsvpButtonState({ rsvp: rsvp() })).toBe('rsvp'));
  it('going when RSVPd', () => expect(rsvpButtonState({ rsvp: rsvp({ going: true }) })).toBe('going'));
  it('full when full and not going', () => expect(rsvpButtonState({ rsvp: rsvp({ full: true }) })).toBe('full'));
  it('going wins over full (member can still cancel)', () => {
    expect(rsvpButtonState({ rsvp: rsvp({ full: true, going: true }) })).toBe('going');
  });
  it('rsvpFullError forces full when not going', () => {
    expect(rsvpButtonState({ rsvp: rsvp() }, true)).toBe('full');
    expect(rsvpButtonState({ rsvp: rsvp({ going: true }) }, true)).toBe('going');
  });
  it('hidden when RSVP is disabled', () => {
    expect(rsvpButtonState({ rsvp: rsvp({ disabled: true }) })).toBe('hidden');
  });
});

describe('reminderTime', () => {
  const now = new Date('2030-09-01T00:00:00.000Z');
  it('is 24h before start', () => {
    const t = reminderTime('2030-09-05T10:00:00.000Z', now)!;
    expect(Date.parse('2030-09-05T10:00:00.000Z') - t.getTime()).toBe(REMINDER_LEAD_MS);
  });
  it('is null when that moment has passed, or input is bad', () => {
    expect(reminderTime('2030-09-01T10:00:00.000Z', now)).toBeNull();
    expect(reminderTime(null, now)).toBeNull();
    expect(reminderTime('garbage', now)).toBeNull();
  });
});
