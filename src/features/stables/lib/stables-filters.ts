import type { HorseStatus } from '@/features/stables/types';

/**
 * Stables list filter chips (S13-04 §2): All (with a count), Following, then
 * one chip per horse status present in the data. SOLD never gets a chip.
 * Client-side over `useHorses`.
 */
export type StablesFilter = 'all' | 'following' | Exclude<HorseStatus, 'SOLD'>;

/** Display order for the status chips (only those present are shown). */
export const STATUS_CHIP_ORDER: readonly Exclude<HorseStatus, 'SOLD'>[] = [
  'PRE_TRAINING',
  'IN_TRAINING',
  'REHAB',
  'RETIRED',
];

/**
 * Route param that preselects a chip: `/stables?filter=following` (S13-08
 * links with it). Unknown or absent values fall back to "All".
 */
export const STABLES_FILTER_PARAM = 'filter';

export function parseStablesFilterParam(value: string | string[] | undefined): StablesFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'following' ? 'following' : 'all';
}

type FilterableHorse = { status: HorseStatus; isFollowing: boolean };

export type StablesFilterChip = { key: StablesFilter; count?: number };

/** The chips to render, in order. Labels are applied by the screen. */
export function buildStablesFilterChips(horses: readonly FilterableHorse[]): StablesFilterChip[] {
  const present = new Set(horses.map(h => h.status));
  return [
    { key: 'all', count: horses.length },
    { key: 'following' },
    ...STATUS_CHIP_ORDER.filter(status => present.has(status)).map(key => ({ key })),
  ];
}

export function applyStablesFilter<T extends FilterableHorse>(horses: readonly T[], filter: StablesFilter): T[] {
  if (filter === 'all')
    return [...horses];
  if (filter === 'following')
    return horses.filter(h => h.isFollowing);
  return horses.filter(h => h.status === filter);
}

/**
 * A status chip can vanish when the data changes (e.g. the last Rehab horse
 * returns to training). Fall back to "All" rather than an empty, chip-less
 * selection.
 */
export function resolveStablesFilter(filter: StablesFilter, chips: readonly StablesFilterChip[]): StablesFilter {
  return chips.some(chip => chip.key === filter) ? filter : 'all';
}
