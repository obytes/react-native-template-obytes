import { BENEFITS_FALLBACK, CHARITY_FALLBACK, charitySubtitle, offersSubtitle } from '@/features/paddock/lib/hub-copy';

describe('offersSubtitle', () => {
  it('falls back while unknown or empty', () => {
    expect(offersSubtitle(null)).toBe(BENEFITS_FALLBACK);
    expect(offersSubtitle(0)).toBe(BENEFITS_FALLBACK);
  });
  it('pluralises', () => {
    expect(offersSubtitle(1)).toBe('1 offer');
    expect(offersSubtitle(3)).toBe('3 offers');
  });
});

describe('charitySubtitle', () => {
  it('falls back without a charity', () => {
    expect(charitySubtitle(null)).toBe(CHARITY_FALLBACK);
    expect(charitySubtitle(undefined)).toBe(CHARITY_FALLBACK);
  });
  it('adds the vote clause only with a poll', () => {
    expect(charitySubtitle({ totalCents: 2_450_000, pollId: 'p1' })).toBe('€24,500 raised to date. Vote on what’s next');
    expect(charitySubtitle({ totalCents: 2_450_000, pollId: null })).toBe('€24,500 raised to date');
  });
});
