import type { Href } from 'expo-router';

const DAY_MS = 24 * 60 * 60 * 1000;

export type YardChipKey = 'raceDay' | 'unread' | 'events';

export type YardChip = {
  key: YardChipKey;
  label: string;
  /** Only set when > 0 (the badge hides otherwise). */
  count?: number;
  href: Href;
};

export type YardChipsInput = {
  /** Horse ids of followed horses with a run whose post time is today. */
  raceDayHorseIds: string[];
  unread: number;
  /** Upcoming events starting today or in the next 7 days. */
  eventsThisWeek: number;
};

export type YardChips = {
  items: YardChip[];
  /** The first chip with a count > 0 renders selected (the frame's lilac "Race day"). */
  selectedKey: YardChipKey | undefined;
};

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Followed horses running today, from the next-run entry (S13-03 §3 "Race day"). */
export function raceDayHorseIds(
  entries: Array<{ horse: { id: string }; race: { postTime: string } }>,
  followedHorseIds: ReadonlySet<string>,
  now: Date,
): string[] {
  const ids = entries
    .filter(e => followedHorseIds.has(e.horse.id) && isSameLocalDay(new Date(e.race.postTime), now))
    .map(e => e.horse.id);
  return [...new Set(ids)];
}

/** Events that start from the start of today up to 7 days out. */
export function countEventsThisWeek(events: Array<{ startsAt: string | null }>, now: Date): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 7 * DAY_MS;
  return events.filter((e) => {
    if (!e.startsAt)
      return false;
    const t = new Date(e.startsAt).getTime();
    return t >= start && t < end;
  }).length;
}

function positive(n: number): number | undefined {
  return n > 0 ? n : undefined;
}

/**
 * S13-03 §3: navigational shortcuts. A chip renders only when it has a
 * target; its count badge shows only when > 0. "Mentions" stays hidden
 * until S13-14 ships a `mention` inbox kind.
 */
export function buildYardChips({ raceDayHorseIds: ids, unread, eventsThisWeek }: YardChipsInput): YardChips {
  const items: YardChip[] = [];
  if (ids.length > 0) {
    items.push({
      key: 'raceDay',
      label: 'Race day',
      count: ids.length,
      href: ids.length === 1 ? `/stables/${ids[0]}` : '/stables',
    });
  }
  items.push({ key: 'unread', label: 'Unread', count: positive(unread), href: '/notifications' });
  items.push({ key: 'events', label: 'Events', count: positive(eventsThisWeek), href: '/events' });

  const selectedKey = items.find(i => (i.count ?? 0) > 0)?.key;
  return { items, selectedKey };
}
