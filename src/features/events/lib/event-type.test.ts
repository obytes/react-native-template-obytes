import colors from '@/components/ui/colors';

import { eventDayColour, eventKind, eventStripColourway } from './event-type';

describe('event type styling', () => {
  it('falls back to lilac-strong days and navy strips without a type', () => {
    expect(eventDayColour(undefined)).toBe(colors.onPrimaryContainer);
    expect(eventDayColour(null)).toBe(colors.onPrimaryContainer);
    expect(eventStripColourway(undefined)).toBe('navy');
    expect(eventKind(undefined)).toBeNull();
  });
  it('maps types when present', () => {
    expect(eventStripColourway('Race Day')).toBe('plum');
    expect(eventStripColourway('Stable Visit')).toBe('green');
    expect(eventStripColourway('Brunch')).toBe('navy');
    expect(eventDayColour('Stable Visit')).toBe(colors.sage);
    expect(eventDayColour('Brunch')).toBe(colors.secondaryContainer);
    expect(eventDayColour('race_day')).toBe(colors.onPrimaryContainer);
  });
});
