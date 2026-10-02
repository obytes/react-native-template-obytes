import { isNewItem, pickInsideTrackTeaser, slotsRemaining } from './card-helpers';

const now = new Date(2026, 9, 2, 9, 0);
const DAY = 24 * 60 * 60 * 1000;

describe('isNewItem', () => {
  it('is new within 7 days', () => {
    expect(isNewItem(new Date(now.getTime() - 6 * DAY).toISOString(), now)).toBe(true);
    expect(isNewItem(new Date(now.getTime() - 8 * DAY).toISOString(), now)).toBe(false);
  });

  it('is not new without a valid date', () => {
    expect(isNewItem(null, now)).toBe(false);
    expect(isNewItem('nope', now)).toBe(false);
  });
});

describe('pickInsideTrackTeaser', () => {
  const item = (id: string) => ({ id }) as never;

  it('prefers the latest piece, then pinned', () => {
    expect(pickInsideTrackTeaser({ ok: true, configured: true, latest: [item('a')], pinned: [item('b')] })).toEqual({ id: 'a' });
    expect(pickInsideTrackTeaser({ ok: true, configured: true, latest: [], pinned: [item('b')] })).toEqual({ id: 'b' });
    expect(pickInsideTrackTeaser(undefined)).toBeUndefined();
  });
});

describe('slotsRemaining', () => {
  const rsvp = { going: false, status: null, disabled: false, full: false };

  it('shows remaining over limit when a limit is set', () => {
    expect(slotsRemaining({ ...rsvp, count: 8, limit: 20 })).toBe('12/20 slots remaining');
    expect(slotsRemaining({ ...rsvp, count: 25, limit: 20 })).toBe('0/20 slots remaining');
  });

  it('is hidden without a limit', () => {
    expect(slotsRemaining({ ...rsvp, count: 8, limit: null })).toBeNull();
  });
});
