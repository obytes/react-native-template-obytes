import {
  getActiveSection,
  getSectionScrollTarget,
  getVisibleHorseSections,
} from './horse-sections';

const EMPTY = {
  hasStory: false,
  hasPedigree: false,
  hasNextEntry: false,
  resultCount: 0,
  updateCount: 0,
  wellbeingCount: 0,
};

describe('getVisibleHorseSections', () => {
  it('hides every chip for an empty horse', () => {
    expect(getVisibleHorseSections(EMPTY)).toEqual([]);
  });

  it('shows all four in order when every section has content', () => {
    expect(getVisibleHorseSections({
      hasStory: true,
      hasPedigree: true,
      hasNextEntry: true,
      resultCount: 2,
      updateCount: 3,
      wellbeingCount: 1,
    })).toEqual(['story', 'racing', 'updates', 'wellbeing']);
  });

  it('shows Story for pedigree alone and Racing for results alone', () => {
    expect(getVisibleHorseSections({ ...EMPTY, hasPedigree: true, resultCount: 1 })).toEqual(['story', 'racing']);
  });

  it('hides Racing with no entries and Wellbeing with no wellbeing updates', () => {
    expect(getVisibleHorseSections({ ...EMPTY, hasStory: true, updateCount: 2 })).toEqual(['story', 'updates']);
  });
});

describe('getActiveSection', () => {
  const offsets = [
    { key: 'racing' as const, y: 900 },
    { key: 'story' as const, y: 420 },
    { key: 'updates' as const, y: 1300 },
  ];

  it('selects the first section before any has been reached', () => {
    expect(getActiveSection(offsets, 0)).toBe('story');
  });

  it('tracks the last section whose top crossed the threshold line', () => {
    expect(getActiveSection(offsets, 500, { threshold: 80 })).toBe('story');
    expect(getActiveSection(offsets, 830, { threshold: 80 })).toBe('racing');
    expect(getActiveSection(offsets, 1250, { threshold: 80 })).toBe('updates');
  });

  it('selects the last section at the end of the content', () => {
    expect(getActiveSection(offsets, 700, { atEnd: true })).toBe('updates');
  });

  it('returns undefined with nothing measured', () => {
    expect(getActiveSection([], 100)).toBeUndefined();
  });
});

describe('getSectionScrollTarget', () => {
  it('leaves breathing room and clamps at zero', () => {
    expect(getSectionScrollTarget(420)).toBe(408);
    expect(getSectionScrollTarget(4)).toBe(0);
  });
});
