import type { Colourway } from '@/components/brand/pattern';

import colors from '@/components/ui/colors';

/**
 * Type-driven styling for events (S13-05 / S13-11). `event.type` is optional
 * and arrives later; without it everything falls back to `other`/default so
 * no mobile change is needed when the backend ships it.
 */
export type EventKind = 'race-day' | 'stable-visit' | 'other';

export function eventKind(type: string | null | undefined): EventKind | null {
  if (!type)
    return null;
  const t = type.toLowerCase();
  if (t.includes('race'))
    return 'race-day';
  if (t.includes('stable'))
    return 'stable-visit';
  return 'other';
}

/** Calendar day fill. Until a type exists every event day is lilac-strong. */
export function eventDayColour(type: string | null | undefined): string {
  switch (eventKind(type)) {
    case 'stable-visit': return colors.sage;
    case 'other': return colors.secondaryContainer;
    default: return colors.onPrimaryContainer; // race day + untyped (lilac-strong)
  }
}

/** Card pattern-strip colourway. Until a type exists: navy. */
export function eventStripColourway(type: string | null | undefined): Colourway {
  switch (eventKind(type)) {
    case 'race-day': return 'plum';
    case 'stable-visit': return 'green';
    default: return 'navy';
  }
}
