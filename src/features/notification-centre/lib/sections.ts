import type { InboxItem, InboxSectionKey } from '@/features/notification-centre/types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TITLES: Record<InboxSectionKey, string> = { today: 'Today', week: 'This week', earlier: 'Earlier' };
const ORDER: InboxSectionKey[] = ['today', 'week', 'earlier'];

function sectionFor(updatedAt: string, now: Date): InboxSectionKey {
  const date = new Date(updatedAt);
  if (date.toDateString() === now.toDateString())
    return 'today';
  return now.getTime() - date.getTime() < WEEK_MS ? 'week' : 'earlier';
}

export function groupInboxSections(items: InboxItem[], now: Date) {
  const buckets: Record<InboxSectionKey, InboxItem[]> = { today: [], week: [], earlier: [] };
  for (const item of items)
    buckets[sectionFor(item.updatedAt, now)].push(item);
  return ORDER.filter(key => buckets[key].length > 0).map(key => ({ key, title: TITLES[key], data: buckets[key] }));
}
