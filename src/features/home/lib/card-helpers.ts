import type { ClubEventRsvp } from '@/features/events/types';
import type { InsideTrackResult, MemberFeedItem } from '@/features/member-content/types';

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** "NEW" shows when the piece was created within the last 7 days. */
export function isNewItem(createdAt: string | null, now: Date): boolean {
  if (!createdAt)
    return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t))
    return false;
  const age = now.getTime() - t;
  return age >= 0 && age <= NEW_WINDOW_MS;
}

export function pickInsideTrackTeaser(data: InsideTrackResult | undefined): MemberFeedItem | undefined {
  return data?.latest[0] ?? data?.pinned[0];
}

/** "12/20 slots remaining", only when the event has an RSVP limit. */
export function slotsRemaining(rsvp: ClubEventRsvp): string | null {
  if (rsvp.limit === null || rsvp.limit <= 0)
    return null;
  const left = Math.max(0, rsvp.limit - rsvp.count);
  return `${left}/${rsvp.limit} slots remaining`;
}
