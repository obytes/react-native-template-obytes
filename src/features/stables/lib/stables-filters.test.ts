import type { HorseStatus } from '@/features/stables/types';

import {
  applyStablesFilter,
  buildStablesFilterChips,
  parseStablesFilterParam,
  resolveStablesFilter,
} from './stables-filters';

function horse(id: string, status: HorseStatus, isFollowing = false) {
  return { id, status, isFollowing };
}

const HORSES = [
  horse('a', 'IN_TRAINING', true),
  horse('b', 'RETIRED'),
  horse('c', 'IN_TRAINING'),
  horse('d', 'SOLD', true),
  horse('e', 'PRE_TRAINING'),
];

describe('buildStablesFilterChips', () => {
  it('starts with All (total count) and Following, then present statuses in order', () => {
    expect(buildStablesFilterChips(HORSES)).toEqual([
      { key: 'all', count: 5 },
      { key: 'following' },
      { key: 'PRE_TRAINING' },
      { key: 'IN_TRAINING' },
      { key: 'RETIRED' },
    ]);
  });

  it('never adds a SOLD chip and omits absent statuses', () => {
    const keys = buildStablesFilterChips([horse('x', 'SOLD'), horse('y', 'REHAB')]).map(c => c.key);
    expect(keys).toEqual(['all', 'following', 'REHAB']);
  });

  it('still renders All and Following with no horses', () => {
    expect(buildStablesFilterChips([])).toEqual([{ key: 'all', count: 0 }, { key: 'following' }]);
  });
});

describe('applyStablesFilter', () => {
  it('returns everything for All', () => {
    expect(applyStablesFilter(HORSES, 'all').map(h => h.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('keeps followed horses for Following', () => {
    expect(applyStablesFilter(HORSES, 'following').map(h => h.id)).toEqual(['a', 'd']);
  });

  it('filters by status', () => {
    expect(applyStablesFilter(HORSES, 'IN_TRAINING').map(h => h.id)).toEqual(['a', 'c']);
    expect(applyStablesFilter(HORSES, 'REHAB')).toEqual([]);
  });
});

describe('parseStablesFilterParam', () => {
  it('preselects Following for filter=following', () => {
    expect(parseStablesFilterParam('following')).toBe('following');
    expect(parseStablesFilterParam(['following'])).toBe('following');
  });

  it('falls back to All for absent or unknown values', () => {
    expect(parseStablesFilterParam(undefined)).toBe('all');
    expect(parseStablesFilterParam('IN_TRAINING')).toBe('all');
    expect(parseStablesFilterParam('nonsense')).toBe('all');
  });
});

describe('resolveStablesFilter', () => {
  it('falls back to All when the selected status chip disappears', () => {
    const chips = buildStablesFilterChips([horse('a', 'IN_TRAINING')]);
    expect(resolveStablesFilter('REHAB', chips)).toBe('all');
    expect(resolveStablesFilter('IN_TRAINING', chips)).toBe('IN_TRAINING');
    expect(resolveStablesFilter('following', chips)).toBe('following');
  });
});
