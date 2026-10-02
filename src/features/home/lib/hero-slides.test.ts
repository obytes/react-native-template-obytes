import type { HeroResultInput, HeroRunInput } from './hero-slides';
import type { NewsItem } from '@/features/pulse/api/use-latest-news';

import { buildHeroSlides, formatDayDate, formatDayTime, ordinal } from './hero-slides';

const now = new Date(2026, 9, 2, 9, 0);
const DAY = 24 * 60 * 60 * 1000;

function run(overrides: Partial<HeroRunInput> = {}): HeroRunInput {
  return {
    id: 'e1',
    status: 'DECLARED',
    draw: null,
    weightLbs: null,
    horse: { id: 'h1', name: 'Ashfield Rose', photos: [] },
    race: {
      id: 'r1',
      name: null,
      postTime: new Date(2026, 9, 3, 15, 5).toISOString(),
      meeting: { id: 'm1', date: '2026-10-03', course: { id: 'c1', name: 'Leopardstown' } },
    },
    jockey: null,
    ...overrides,
  };
}

function news(id: string): NewsItem {
  return {
    id,
    slug: `slug-${id}`,
    title: `News ${id}`,
    subtitle: `Subtitle ${id}`,
    featuredImageUrl: 'https://example.com/img.jpg',
    publishedAt: new Date(2026, 9, 1, 12).toISOString(),
    author: null,
  };
}

function result(ranAt: Date, overrides: Partial<HeroResultInput> = {}): HeroResultInput {
  return {
    id: 'res1',
    finishingPosition: 2,
    horse: { id: 'h2', name: 'Mountain Thyme' },
    race: { id: 'r2', postTime: ranAt.toISOString(), meeting: { course: { name: 'Naas' } } },
    ...overrides,
  };
}

describe('buildHeroSlides', () => {
  it('orders run → news → result', () => {
    const slides = buildHeroSlides(
      { nextRun: run(), news: [news('a'), news('b')], results: [result(new Date(now.getTime() - DAY))] },
      now,
    );
    expect(slides.map(s => s.kind)).toEqual(['run', 'news', 'news', 'result']);
  });

  it('builds the run slide', () => {
    const [slide] = buildHeroSlides({ nextRun: run({ timeformComment: 'Ger says she has never worked better.' }), news: [], results: [] }, now);
    expect(slide).toMatchObject({
      title: 'Ashfield Rose declares for Leopardstown',
      date: 'Saturday, 3.05pm',
      excerpt: 'Ger says she has never worked better.',
      cta: { label: 'See the race', kind: 'route', href: '/stables/h1' },
    });
  });

  it('says "runs at" for an entry that is not declared yet', () => {
    const [slide] = buildHeroSlides({ nextRun: run({ status: 'ENTERED' }), news: [], results: [] }, now);
    expect(slide.title).toBe('Ashfield Rose runs at Leopardstown');
  });

  it('builds news slides from the subtitle and ignores the image', () => {
    const [slide] = buildHeroSlides({ nextRun: null, news: [news('a')], results: [] }, now);
    expect(slide).toMatchObject({
      title: 'News a',
      excerpt: 'Subtitle a',
      cta: { label: 'Read the update', kind: 'route', href: '/news/slug-a' },
    });
    expect(JSON.stringify(slide)).not.toContain('img.jpg');
  });

  it('includes a result only within 7 days', () => {
    const fresh = buildHeroSlides({ nextRun: null, news: [], results: [result(new Date(now.getTime() - 6 * DAY))] }, now);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].title).toBe('Mountain Thyme finishes 2nd at Naas');
    const stale = buildHeroSlides({ nextRun: null, news: [], results: [result(new Date(now.getTime() - 8 * DAY))] }, now);
    expect(stale).toHaveLength(0);
  });

  it('uses "Watch replay" when the result has a replay', () => {
    const [slide] = buildHeroSlides(
      { nextRun: null, news: [], results: [result(new Date(now.getTime() - DAY), { replayUrl: 'https://replay' })] },
      now,
    );
    expect(slide.cta).toEqual({ label: 'Watch replay', kind: 'external', url: 'https://replay' });
  });

  it('falls back to "See the result" without a replay', () => {
    const [slide] = buildHeroSlides({ nextRun: null, news: [], results: [result(new Date(now.getTime() - DAY))] }, now);
    expect(slide.cta).toEqual({ label: 'See the result', kind: 'route', href: '/stables/h2' });
  });

  it('caps at 5 slides', () => {
    const slides = buildHeroSlides(
      {
        nextRun: run(),
        news: [news('a'), news('b'), news('c'), news('d')],
        results: [result(new Date(now.getTime() - DAY))],
      },
      now,
    );
    expect(slides).toHaveLength(5);
    expect(slides.map(s => s.kind)).toEqual(['run', 'news', 'news', 'news', 'news']);
  });

  it('is empty with no data', () => {
    expect(buildHeroSlides({ nextRun: null, news: undefined, results: undefined }, now)).toEqual([]);
  });
});

describe('formatters', () => {
  it('formats day and time', () => {
    expect(formatDayTime(new Date(2026, 9, 3, 15, 5).toISOString())).toBe('Saturday, 3.05pm');
    expect(formatDayTime(new Date(2026, 9, 3, 0, 30).toISOString())).toBe('Saturday, 12.30am');
    expect(formatDayTime('nope')).toBeNull();
  });

  it('formats day and date', () => {
    expect(formatDayDate(new Date(2026, 9, 2, 12).toISOString())).toBe('Friday 2 October');
  });

  it('builds ordinals', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd']);
  });
});
