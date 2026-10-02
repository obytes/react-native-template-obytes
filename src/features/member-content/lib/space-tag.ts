export type SpaceTagTone = 'sage' | 'ice' | 'cream';

/** Racing = sage, New to racing = ice, every other space = cream (S13-06). */
export function spaceTagTone(spaceName: string | null | undefined): SpaceTagTone {
  const name = (spaceName ?? '').trim().toLowerCase();
  if (name === 'racing') {
    return 'sage';
  }
  if (name === 'new to racing') {
    return 'ice';
  }
  return 'cream';
}

export const SPACE_TAG_CLASS: Record<SpaceTagTone, string> = {
  sage: 'bg-sage',
  ice: 'bg-ice',
  cream: 'bg-secondary-container',
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
