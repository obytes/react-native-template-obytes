import type { FeedChip } from '@/features/member-content/types';

/** Badge category for a space; one tone per category (S13-06, design-system.md). */
export type SpaceTagTone = 'horses' | 'official' | 'news' | 'charity' | 'polls' | 'community' | 'unknown';

const NAME_RULES: { tone: SpaceTagTone; pattern: RegExp }[] = [
  { tone: 'official', pattern: /official|announcement/ },
  { tone: 'news', pattern: /news/ },
  { tone: 'charity', pattern: /charit/ },
  { tone: 'polls', pattern: /poll/ },
  { tone: 'community', pattern: /introduc|network|new to racing|lifestyle|general|community|social|racing|welcome|chat/ },
];

/** Ids of every horse space, from the S12-02b "Horses" feed chip (the source of truth for horse spaces). */
export function horseSpaceIds(chips: FeedChip[] | undefined): Set<string> {
  const ids = new Set<string>();
  for (const chip of chips ?? []) {
    if (chip.kind === 'horses') {
      chip.spaceIds.forEach(id => ids.add(id));
    }
  }
  return ids;
}

/**
 * Category for a space badge. Horse spaces come from the feed-chip data; the
 * other categories have no space-level data, so they fall back to name heuristics.
 */
export function spaceTagTone(
  spaceName: string | null | undefined,
  spaceId?: string | null,
  horseIds?: ReadonlySet<string>,
): SpaceTagTone {
  if (spaceId && horseIds?.has(spaceId)) {
    return 'horses';
  }
  const name = (spaceName ?? '').trim().toLowerCase();
  return NAME_RULES.find(rule => rule.pattern.test(name))?.tone ?? 'unknown';
}

/** Fill + text classes per category (tokens only). */
export const SPACE_TAG_CLASS: Record<SpaceTagTone, { container: string; text: string }> = {
  horses: { container: 'bg-sage', text: 'text-forest' },
  official: { container: 'bg-primary', text: 'text-white' },
  news: { container: 'bg-ice', text: 'text-ink' },
  charity: { container: 'bg-forest/15', text: 'text-forest' },
  polls: { container: 'bg-primary-fixed', text: 'text-plum' },
  community: { container: 'bg-primary-fixed/50', text: 'text-plum-mid' },
  unknown: { container: 'bg-secondary-container', text: 'text-ink-variant' },
};

/** Compact relative time ("2h ago"); falls back to a short date past a week. */
export function formatRelativeTime(value: string | null | undefined, now: number = Date.now()): string | null {
  if (!value) {
    return null;
  }
  const then = Date.parse(value);
  if (Number.isNaN(then)) {
    return null;
  }
  const minutes = Math.floor(Math.max(0, now - then) / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
