import { buildYardChips, countEventsThisWeek, raceDayHorseIds } from './yard-chips';

const now = new Date(2026, 9, 2, 9, 0);

function entry(horseId: string, postTime: Date) {
  return { horse: { id: horseId }, race: { postTime: postTime.toISOString() } };
}

describe('raceDayHorseIds', () => {
  it('keeps followed horses running today', () => {
    const today = new Date(2026, 9, 2, 15, 5);
    expect(raceDayHorseIds([entry('h1', today)], new Set(['h1']), now)).toEqual(['h1']);
  });

  it('drops unfollowed horses and other days', () => {
    const today = new Date(2026, 9, 2, 15, 5);
    const tomorrow = new Date(2026, 9, 3, 15, 5);
    expect(raceDayHorseIds([entry('h2', today)], new Set(['h1']), now)).toEqual([]);
    expect(raceDayHorseIds([entry('h1', tomorrow)], new Set(['h1']), now)).toEqual([]);
  });
});

describe('countEventsThisWeek', () => {
  it('counts events from the start of today to 7 days out', () => {
    const events = [
      { startsAt: new Date(2026, 9, 2, 7, 0).toISOString() }, // earlier today
      { startsAt: new Date(2026, 9, 8, 23, 0).toISOString() }, // day 7
      { startsAt: new Date(2026, 9, 9, 0, 0).toISOString() }, // 7 days later, excluded
      { startsAt: new Date(2026, 9, 1, 23, 0).toISOString() }, // yesterday, excluded
      { startsAt: null },
    ];
    expect(countEventsThisWeek(events, now)).toBe(2);
  });
});

describe('buildYardChips', () => {
  it('hides Race day with no runs today and never renders Mentions', () => {
    const { items } = buildYardChips({ raceDayHorseIds: [], unread: 0, eventsThisWeek: 0 });
    expect(items.map(i => i.key)).toEqual(['unread', 'events']);
  });

  it('shows count badges only when > 0', () => {
    const { items } = buildYardChips({ raceDayHorseIds: [], unread: 0, eventsThisWeek: 2 });
    expect(items.find(i => i.key === 'unread')?.count).toBeUndefined();
    expect(items.find(i => i.key === 'events')?.count).toBe(2);
  });

  it('routes Race day to the horse when one runs, else to Stables', () => {
    const one = buildYardChips({ raceDayHorseIds: ['h1'], unread: 0, eventsThisWeek: 0 });
    expect(one.items[0]).toMatchObject({ key: 'raceDay', count: 1, href: '/stables/h1' });
    const two = buildYardChips({ raceDayHorseIds: ['h1', 'h2'], unread: 0, eventsThisWeek: 0 });
    expect(two.items[0]).toMatchObject({ key: 'raceDay', count: 2, href: '/stables' });
  });

  it('routes Unread to notifications and Events to the Events tab', () => {
    const { items } = buildYardChips({ raceDayHorseIds: [], unread: 3, eventsThisWeek: 0 });
    expect(items.find(i => i.key === 'unread')?.href).toBe('/notifications');
    expect(items.find(i => i.key === 'events')?.href).toBe('/events');
  });

  it('selects the first chip with a count', () => {
    expect(buildYardChips({ raceDayHorseIds: ['h1'], unread: 3, eventsThisWeek: 1 }).selectedKey).toBe('raceDay');
    expect(buildYardChips({ raceDayHorseIds: [], unread: 0, eventsThisWeek: 1 }).selectedKey).toBe('events');
    expect(buildYardChips({ raceDayHorseIds: [], unread: 0, eventsThisWeek: 0 }).selectedKey).toBeUndefined();
  });
});
