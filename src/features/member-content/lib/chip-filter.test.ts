import type { FeedChip } from '@/features/member-content/types';

import { chipToFilter, filterKeyPart } from '@/features/member-content/lib/chip-filter';

function chip(overrides: Partial<FeedChip>): FeedChip {
  return { id: 'all', label: 'All', kind: 'all', spaceIds: [], ...overrides };
}

describe('chipToFilter', () => {
  it('maps the all chip to no filter', () => {
    expect(chipToFilter(chip({ id: 'all', kind: 'all' }))).toBeUndefined();
  });

  it('maps the horses chip to its space ids', () => {
    expect(chipToFilter(chip({ id: 'horses', kind: 'horses', spaceIds: ['1', '2'] })))
      .toEqual({ spaceIds: ['1', '2'] });
  });

  it('maps the news chip to a story kind filter', () => {
    expect(chipToFilter(chip({ id: 'news', kind: 'news' }))).toEqual({ kind: 'story' });
  });

  it('maps the charity chip to a story filter scoped to charity', () => {
    expect(chipToFilter(chip({ id: 'charity', kind: 'charity' })))
      .toEqual({ kind: 'story', category: 'charity' });
  });

  it('maps the polls chip to a poll kind filter', () => {
    expect(chipToFilter(chip({ id: 'polls', kind: 'polls' }))).toEqual({ kind: 'poll' });
  });

  it('maps a space chip to its space ids', () => {
    expect(chipToFilter(chip({ id: 'space:sp1', kind: 'space', spaceIds: ['sp1'] })))
      .toEqual({ spaceIds: ['sp1'] });
  });
});

describe('filterKeyPart', () => {
  it('returns an empty string for no filter', () => {
    expect(filterKeyPart(undefined)).toBe('');
  });

  it('returns an empty string for an empty filter', () => {
    expect(filterKeyPart({})).toBe('');
  });

  it('formats a poll kind filter', () => {
    expect(filterKeyPart({ kind: 'poll' })).toBe('kind=poll');
  });

  it('formats a story kind filter', () => {
    expect(filterKeyPart({ kind: 'story' })).toBe('kind=story');
  });

  it('formats a story kind filter with a category', () => {
    expect(filterKeyPart({ kind: 'story', category: 'charity' })).toBe('kind=story,cat=charity');
  });

  it('formats a space ids filter preserving order', () => {
    expect(filterKeyPart({ spaceIds: ['1', '2'] })).toBe('spaces=1,2');
  });
});
