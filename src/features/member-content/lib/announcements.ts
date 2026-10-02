import type { FeedChip, MemberFeedItem } from '@/features/member-content/types';

export const MAX_ANNOUNCEMENTS = 5;

const ANNOUNCEMENT_SPACE_NAME = /\bannouncements?\b/i;

/**
 * Space ids that look like the Official Announcements space, taken from the
 * space chips (the mobile app never sees `circle.communitySpaceId` directly).
 */
export function announcementSpaceIdsFromChips(chips: FeedChip[]): string[] {
  return chips
    .filter(chip => chip.kind === 'space' && ANNOUNCEMENT_SPACE_NAME.test(chip.label))
    .flatMap(chip => chip.spaceIds);
}

/**
 * Picks the posts shown in the Community announcement carousel (S13-06).
 * Client heuristic until S13-11: a post is an announcement when the backend
 * flags it (`isAnnouncement`), its space is a known announcements space, or its
 * space name reads "Announcements". Only openable posts qualify; newest first.
 */
export function selectAnnouncements(
  items: MemberFeedItem[] | undefined,
  announcementSpaceIds: string[] = [],
  limit = MAX_ANNOUNCEMENTS,
): MemberFeedItem[] {
  if (!items) {
    return [];
  }
  const ids = new Set(announcementSpaceIds);
  return [...items]
    .filter(item => item.kind === 'post' && item.spaceId !== null)
    .filter(item =>
      item.isAnnouncement === true
      || (item.spaceId !== null && ids.has(item.spaceId))
      || (item.spaceName !== null && ANNOUNCEMENT_SPACE_NAME.test(item.spaceName)),
    )
    .sort((a, b) => (Date.parse(b.createdAt ?? '') || 0) - (Date.parse(a.createdAt ?? '') || 0))
    .slice(0, limit);
}
