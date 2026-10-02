import type { Entry, EntryStatus } from '@/features/stables/types';

import {
  abbreviateRaceType,
  buildHorseShareContent,
  formatDeclaredDate,
  formatDistance,
  formatRaceDayTime,
  formatRaceDescriptor,
  formatResultLine,
  formatResultMeta,
  getDeclaredEntry,
  getFoaledLine,
  getNextEntry,
  getPedigreeRows,
  getProfileLine,
  getResults,
  getStoryText,
  getTrainerLine,
  getWellbeingUpdates,
  ordinal,
} from './horse-facts';

// Local-time ISO strings so the formatted output doesn't depend on the TZ.
function local([y, m, d, h = 12, min = 0]: [number, number, number, number?, number?]): string {
  return new Date(y, m - 1, d, h, min).toISOString();
}

function entry({ id, status, postTime, ...overrides }: Partial<Entry> & { id: string; status: EntryStatus; postTime: string }): Entry {
  return {
    id,
    status,
    draw: null,
    weightLbs: null,
    finishingPosition: null,
    beatenLengths: null,
    ratingAchieved: null,
    timeformComment: null,
    performanceRating: null,
    starRating: null,
    createdAt: postTime,
    updatedAt: postTime,
    jockey: null,
    race: {
      id: `race-${id}`,
      name: null,
      postTime,
      raceType: 'Maiden',
      distanceFurlongs: 6,
      className: null,
      goingDescription: null,
      meeting: { id: 'm', date: postTime, course: { id: 'c', name: 'Naas', country: 'IRE' } },
    },
    ...overrides,
  };
}

const NOW = new Date(2026, 6, 10, 9, 0);

describe('ordinal / distance / race type', () => {
  it('formats ordinals including the teens', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '101st',
    ]);
  });

  it('formats furlongs as racecard distances', () => {
    expect(formatDistance(7)).toBe('7f');
    expect(formatDistance(8)).toBe('1m');
    expect(formatDistance(22)).toBe('2m6f');
  });

  it('abbreviates known race types and lower-cases the rest', () => {
    expect(abbreviateRaceType('Maiden')).toBe('mdn');
    expect(abbreviateRaceType('Hurdle')).toBe('hdl');
    expect(abbreviateRaceType('Flat')).toBe('flat');
    expect(abbreviateRaceType(null)).toBeNull();
    expect(abbreviateRaceType('  ')).toBeNull();
  });

  it('builds the race descriptor from what exists', () => {
    const e = entry({ id: '1', status: 'DECLARED', postTime: local([2026, 7, 18]) });
    expect(formatRaceDescriptor(e.race)).toBe('Naas, 6f mdn');
    expect(formatRaceDescriptor({ ...e.race, distanceFurlongs: null, raceType: null })).toBe('Naas');
  });
});

describe('entries', () => {
  const past = entry({ id: 'past', status: 'DECLARED', postTime: local([2026, 7, 1]) });
  const declared = entry({ id: 'dec', status: 'DECLARED', postTime: local([2026, 7, 18, 15, 5]) });
  const entered = entry({ id: 'ent', status: 'ENTERED', postTime: local([2026, 7, 12]) });
  const ran1 = entry({ id: 'r1', status: 'RAN', postTime: local([2026, 5, 30]), finishingPosition: 5 });
  const ran2 = entry({ id: 'r2', status: 'RAN', postTime: local([2026, 6, 21]), finishingPosition: 3 });

  it('picks the soonest upcoming entry and ignores past ones', () => {
    expect(getNextEntry([past, declared, entered, ran1], NOW)?.id).toBe('ent');
    expect(getNextEntry([past], NOW)).toBeUndefined();
    expect(getNextEntry(undefined, NOW)).toBeUndefined();
  });

  it('only reports a declared entry when the next entry is declared', () => {
    expect(getDeclaredEntry([declared, entered], NOW)).toBeUndefined();
    expect(getDeclaredEntry([declared, ran1], NOW)?.id).toBe('dec');
  });

  it('lists results newest first', () => {
    expect(getResults([ran1, declared, ran2]).map(e => e.id)).toEqual(['r2', 'r1']);
  });

  it('formats the declared pill and race day/time', () => {
    expect(formatDeclaredDate(local([2026, 8, 18]))).toBe('Tue Aug 18th');
    expect(formatRaceDayTime(local([2026, 7, 18, 15, 5]))).toBe('Sat 18 July · 15:05');
  });

  it('formats a result line without S13-10 fields', () => {
    expect(formatResultLine(ran2)).toBe('Naas, 6f mdn — 3rd');
    expect(formatResultMeta(ran2)).toBe('21 June');
  });

  it('adds field size and SP once S13-10 ships', () => {
    const full = { ...ran2, fieldSize: 11, startingPrice: '6/1' };
    expect(formatResultLine(full)).toBe('Naas, 6f mdn — 3rd of 11');
    expect(formatResultMeta(full)).toBe('21 June · 6/1');
  });
});

describe('profile facts (S13-10 field presence)', () => {
  it('is null with no facts, so the line stays hidden', () => {
    expect(getProfileLine({})).toBeNull();
  });

  it('prefers the server profileLine', () => {
    expect(getProfileLine({ profileLine: 'Bay filly, 3 years old', colour: 'Grey' })).toBe('Bay filly, 3 years old');
  });

  it('composes from parts', () => {
    expect(getProfileLine({ colour: 'Bay', sex: 'FILLY', ageYears: 3 })).toBe('Bay filly, 3 years old');
    expect(getProfileLine({ sex: 'COLT', ageYears: 1 })).toBe('Colt, 1 year old');
    expect(getProfileLine({ colour: 'Chestnut' })).toBe('Chestnut');
  });

  it('shows the trainer alone until a location exists', () => {
    expect(getTrainerLine({ trainer: { id: 't', name: 'G. Byrne' } })).toBe('G. Byrne');
    expect(getTrainerLine({ trainer: { id: 't', name: 'G. Byrne', location: 'Kildare' } })).toBe('G. Byrne, Kildare');
    expect(getTrainerLine({ trainer: null })).toBeNull();
  });

  it('formats the foaled line from date and/or place', () => {
    expect(getFoaledLine({})).toBeNull();
    expect(getFoaledLine({ foaledOn: '2023-05-12', foaledPlace: 'Co. Meath' })).toBe('May 2023 · Co. Meath');
    expect(getFoaledLine({ foaledPlace: 'Co. Meath' })).toBe('Co. Meath');
  });
});

describe('getWellbeingUpdates', () => {
  it('keeps the latest wellbeing updates only', () => {
    const u = (id: string, updateType: 'wellbeing' | 'trainer') => ({ id, updateType, title: id, bodyText: '', publishedAt: '', circlePostId: null });
    expect(getWellbeingUpdates([u('a', 'wellbeing'), u('b', 'trainer'), u('c', 'wellbeing'), u('d', 'wellbeing'), u('e', 'wellbeing')]).map(x => x.id))
      .toEqual(['a', 'c', 'd']);
    expect(getWellbeingUpdates(undefined)).toEqual([]);
  });
});

describe('story and pedigree', () => {
  it('falls back from story to bio', () => {
    expect(getStoryText({ story: 'Long story', bio: 'Bio' })).toBe('Long story');
    expect(getStoryText({ story: null, bio: 'Bio' })).toBe('Bio');
    expect(getStoryText({ story: ' ', bio: null })).toBeNull();
  });

  it('lists sire, dam, dam\'s sire and foaled when present', () => {
    expect(getPedigreeRows({ pedigree: { sire: 'Starspangledbanner', dam: 'Ashfield Belle' } })).toEqual([
      { key: 'sire', value: 'Starspangledbanner' },
      { key: 'dam', value: 'Ashfield Belle' },
    ]);
    expect(getPedigreeRows({
      pedigree: { sire: 'S', dam: 'D', damsire: 'DS' },
      foaledOn: '2023-05-12',
    }).map(r => r.key)).toEqual(['sire', 'dam', 'damsire', 'foaled']);
    expect(getPedigreeRows({ pedigree: null })).toEqual([]);
  });
});

describe('buildHorseShareContent', () => {
  it('uses the club site when there is no public URL', () => {
    expect(buildHorseShareContent({ name: 'Laska' }, 'Meet Laska.')).toEqual({ message: 'Meet Laska. https://rionna.com' });
  });

  it('uses the public URL when present', () => {
    expect(buildHorseShareContent({ name: 'Laska', publicUrl: 'https://rionna.com/horses/laska' }, 'Meet Laska.').message)
      .toBe('Meet Laska. https://rionna.com/horses/laska');
  });
});
