import type { Href } from 'expo-router';
import type { NewsItem } from '@/features/pulse/api/use-latest-news';
import type { LatestResult, NextRunEntry } from '@/features/pulse/types';

const DAY_MS = 24 * 60 * 60 * 1000;
export const RESULT_WINDOW_MS = 7 * DAY_MS;
export const MAX_HERO_SLIDES = 5;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * The backend returns the full RaceEntry row, so these fields are on the
 * payload even though the pulse types don't declare them. Optional: older
 * cached payloads may not have them.
 */
export type HeroRunInput = NextRunEntry & { timeformComment?: string | null };
export type HeroResultInput = LatestResult & { replayUrl?: string | null };

export type HeroSlideCta
  = | { label: string; kind: 'route'; href: Href }
    | { label: string; kind: 'external'; url: string };

export type HeroSlide = {
  key: string;
  kind: 'run' | 'news' | 'result';
  title: string;
  date: string | null;
  excerpt: string | null;
  cta: HeroSlideCta;
};

export type HeroSlidesInput = {
  nextRun: HeroRunInput | null | undefined;
  news: NewsItem[] | null | undefined;
  results: HeroResultInput[] | null | undefined;
};

function validDate(iso: string | null | undefined): Date | null {
  if (!iso)
    return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Saturday, 3.05pm" (device time zone; Hermes-safe, no Intl). */
export function formatDayTime(iso: string): string | null {
  const d = validDate(iso);
  if (!d)
    return null;
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${WEEKDAYS[d.getDay()]}, ${hour12}.${minutes}${h < 12 ? 'am' : 'pm'}`;
}

/** "Friday 2 October". */
export function formatDayDate(iso: string): string | null {
  const d = validDate(iso);
  if (!d)
    return null;
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11)
    return `${n}st`;
  if (rem10 === 2 && rem100 !== 12)
    return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13)
    return `${n}rd`;
  return `${n}th`;
}

function runSlide(run: HeroRunInput): HeroSlide {
  const course = run.race.meeting.course.name;
  const verb = run.status === 'DECLARED' ? 'declares for' : 'runs at';
  const note = run.timeformComment?.trim()
    || (run.jockey ? `Ridden by ${run.jockey.name}.` : null);
  return {
    key: `run-${run.id}`,
    kind: 'run',
    title: `${run.horse.name} ${verb} ${course}`,
    date: formatDayTime(run.race.postTime),
    excerpt: note,
    cta: { label: 'See the race', kind: 'route', href: `/stables/${run.horse.id}` },
  };
}

function newsSlide(item: NewsItem): HeroSlide {
  return {
    key: `news-${item.id}`,
    kind: 'news',
    title: item.title,
    date: formatDayDate(item.publishedAt),
    excerpt: item.subtitle?.trim() || null,
    cta: { label: 'Read the update', kind: 'route', href: `/news/${item.slug}` },
  };
}

function resultSlide(result: HeroResultInput): HeroSlide {
  const pos = result.finishingPosition;
  const course = result.race.meeting.course.name;
  const title = pos
    ? `${result.horse.name} finishes ${ordinal(pos)} at ${course}`
    : `${result.horse.name} ran at ${course}`;
  const cta: HeroSlideCta = result.replayUrl
    ? { label: 'Watch replay', kind: 'external', url: result.replayUrl }
    : { label: 'See the result', kind: 'route', href: `/stables/${result.horse.id}` };
  return {
    key: `result-${result.id}`,
    kind: 'result',
    title,
    date: formatDayDate(result.race.postTime),
    excerpt: null,
    cta,
  };
}

/**
 * S13-03 §4 (decision 1): the next/declared run is slide 1, then the latest
 * news, then the latest result if it ran within the last 7 days. Max 5.
 */
export function buildHeroSlides({ nextRun, news, results }: HeroSlidesInput, now: Date): HeroSlide[] {
  const slides: HeroSlide[] = [];
  if (nextRun)
    slides.push(runSlide(nextRun));
  for (const item of news ?? [])
    slides.push(newsSlide(item));

  const latest = results?.[0];
  const ranAt = validDate(latest?.race.postTime)?.getTime();
  if (latest && ranAt !== undefined && now.getTime() - ranAt <= RESULT_WINDOW_MS && ranAt <= now.getTime())
    slides.push(resultSlide(latest));

  return slides.slice(0, MAX_HERO_SLIDES);
}
