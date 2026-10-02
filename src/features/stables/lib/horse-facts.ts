import type { Entry, Horse, HorseSex, HorseUpdate, Race } from '@/features/stables/types';

/**
 * Pure formatting for the Stables card and Horse detail (S13-04). Everything
 * that depends on an S13-10 field returns `null` when the field is absent, so
 * callers can hide the element and it lights up once the backend ships.
 *
 * Dates use the device's local time with fixed English names (no Intl), so
 * the output is deterministic across Hermes builds and in tests.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** 1 → "1st", 3 → "3rd", 11 → "11th", 22 → "22nd". */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13)
    return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** Furlongs → "7f", "1m", "2m6f". */
export function formatDistance(furlongs: number): string {
  const miles = Math.floor(furlongs / 8);
  const rest = Math.round((furlongs % 8) * 10) / 10;
  if (miles === 0)
    return `${rest}f`;
  if (rest === 0)
    return `${miles}m`;
  return `${miles}m${rest}f`;
}

const RACE_TYPE_ABBREVIATIONS: Record<string, string> = {
  'maiden': 'mdn',
  'handicap': 'hcap',
  'hurdle': 'hdl',
  'chase': 'chase',
  'nh flat': 'NHF',
  'bumper': 'NHF',
};

/** Racecard shorthand for a race type ("Maiden" → "mdn"); unknown types are lower-cased. */
export function abbreviateRaceType(raceType: string | null | undefined): string | null {
  const trimmed = raceType?.trim();
  if (!trimmed)
    return null;
  const lower = trimmed.toLowerCase();
  return RACE_TYPE_ABBREVIATIONS[lower] ?? lower;
}

/** "Leopardstown, 7f mdn" (course, then distance + type when known). */
export function formatRaceDescriptor(race: Race): string {
  const detail = [
    race.distanceFurlongs != null ? formatDistance(race.distanceFurlongs) : null,
    abbreviateRaceType(race.raceType),
  ].filter(Boolean).join(' ');
  const course = race.meeting.course.name;
  return detail ? `${course}, ${detail}` : course;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** The soonest upcoming DECLARED/ENTERED entry (today or later). */
export function getNextEntry(entries: readonly Entry[] | undefined, now: Date = new Date()): Entry | undefined {
  const today = startOfDay(now);
  return (entries ?? [])
    .filter(e => (e.status === 'DECLARED' || e.status === 'ENTERED') && new Date(e.race.postTime).getTime() >= today)
    .sort((a, b) => new Date(a.race.postTime).getTime() - new Date(b.race.postTime).getTime())[0];
}

/** The next entry, only when it is declared (drives the "Declared · …" pill). */
export function getDeclaredEntry(entries: readonly Entry[] | undefined, now: Date = new Date()): Entry | undefined {
  const next = getNextEntry(entries, now);
  return next?.status === 'DECLARED' ? next : undefined;
}

/** Finished runs, newest first. */
export function getResults(entries: readonly Entry[] | undefined): Entry[] {
  return (entries ?? [])
    .filter(e => e.status === 'RAN')
    .sort((a, b) => new Date(b.race.postTime).getTime() - new Date(a.race.postTime).getTime());
}

/** "Sat Aug 18th" for the Declared pill. */
export function formatDeclaredDate(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]} ${MONTHS_SHORT[d.getMonth()]} ${ordinal(d.getDate())}`;
}

function twoDigits(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "Sat 18 July · 15:05" (rendered uppercase by the mono label). */
export function formatRaceDayTime(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} · ${d.getHours()}:${twoDigits(d.getMinutes())}`;
}

/** "21 June". */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}

/** "Naas, 6f mdn — 3rd of 11" (field size from S13-10 when present). */
export function formatResultLine(entry: Entry): string {
  const descriptor = formatRaceDescriptor(entry.race);
  if (entry.finishingPosition == null)
    return descriptor;
  const field = entry.fieldSize ? ` of ${entry.fieldSize}` : '';
  return `${descriptor} — ${ordinal(entry.finishingPosition)}${field}`;
}

/** "21 June · 6/1" (SP from S13-10 when present). */
export function formatResultMeta(entry: Entry): string {
  const date = formatShortDate(entry.race.postTime);
  const sp = entry.startingPrice?.trim();
  return sp ? `${date} · ${sp}` : date;
}

const SEX_LABELS: Record<HorseSex, string> = {
  FILLY: 'filly',
  COLT: 'colt',
  MARE: 'mare',
  GELDING: 'gelding',
  STALLION: 'stallion',
};

type ProfileFacts = Pick<Horse, 'profileLine' | 'colour' | 'sex' | 'ageYears'>;

/**
 * "Bay filly, 3 years old". Prefers the server-derived `profileLine`
 * (S13-10 §4), else composes it from whichever parts exist. `null` when
 * there's nothing to say (today, until S13-10 ships).
 */
export function getProfileLine(horse: ProfileFacts): string | null {
  const server = horse.profileLine?.trim();
  if (server)
    return server;
  const kind = [horse.colour?.trim(), horse.sex ? SEX_LABELS[horse.sex] : null].filter(Boolean).join(' ');
  const age = horse.ageYears != null && horse.ageYears > 0
    ? `${horse.ageYears} ${horse.ageYears === 1 ? 'year' : 'years'} old`
    : null;
  const parts = [kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : null, age].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/** "G. Byrne, Kildare" (location from S13-10 when present); `null` without a trainer. */
export function getTrainerLine(horse: Pick<Horse, 'trainer'>): string | null {
  const name = horse.trainer?.name?.trim();
  if (!name)
    return null;
  const location = horse.trainer?.location?.trim();
  return location ? `${name}, ${location}` : name;
}

/** "May 2023 · Co. Meath" (S13-10); `null` until a foaling date or place exists. */
export function getFoaledLine(horse: Pick<Horse, 'foaledOn' | 'foaledPlace'>): string | null {
  let when: string | null = null;
  if (horse.foaledOn) {
    // `foaledOn` is a calendar date ("2023-05-12"); read it as UTC so a
    // negative-offset timezone can't shift it into the previous month.
    const d = new Date(horse.foaledOn);
    if (!Number.isNaN(d.getTime()))
      when = `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
  const place = horse.foaledPlace?.trim() || null;
  const parts = [when, place].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** The long-form story, falling back to the short bio. */
export function getStoryText(horse: Pick<Horse, 'story' | 'bio'>): string | null {
  return horse.story?.trim() || horse.bio?.trim() || null;
}

export type PedigreeRowKey = 'sire' | 'dam' | 'damsire' | 'foaled';
export type PedigreeRow = { key: PedigreeRowKey; value: string };

/** Sire, Dam, Dam's sire, then Foaled (S13-10) — only the rows with values. */
export function getPedigreeRows(horse: Pick<Horse, 'pedigree' | 'foaledOn' | 'foaledPlace'>): PedigreeRow[] {
  const rows: PedigreeRow[] = [];
  const { sire, dam, damsire } = horse.pedigree ?? {};
  if (sire?.trim())
    rows.push({ key: 'sire', value: sire.trim() });
  if (dam?.trim())
    rows.push({ key: 'dam', value: dam.trim() });
  if (damsire?.trim())
    rows.push({ key: 'damsire', value: damsire.trim() });
  const foaled = getFoaledLine(horse);
  if (foaled)
    rows.push({ key: 'foaled', value: foaled });
  return rows;
}

/** Club site used when a horse has no public profile URL of its own. */
export const CLUB_SITE_URL = 'https://rionna.com';

/**
 * Share payload for the hero's SHARE action. There is no public horse page
 * yet, so it's the horse's name plus the club link; if the API ever returns a
 * `publicUrl`, that's used instead.
 */
export function buildHorseShareContent(
  horse: Pick<Horse, 'name'> & { publicUrl?: string | null },
  message: string,
): { message: string } {
  // Message-only (URL inlined): iOS would otherwise share message + url as
  // two items, Android ignores `url` entirely.
  const url = horse.publicUrl?.trim() || CLUB_SITE_URL;
  return { message: `${message} ${url}` };
}

/** How many wellbeing updates the Wellbeing card lists. */
export const WELLBEING_ROW_LIMIT = 3;

/** The latest `wellbeing` horse updates (the feed is newest first). */
export function getWellbeingUpdates(updates: readonly HorseUpdate[] | undefined): HorseUpdate[] {
  return (updates ?? []).filter(u => u.updateType === 'wellbeing').slice(0, WELLBEING_ROW_LIMIT);
}
