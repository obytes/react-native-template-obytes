import type { InfiniteData } from '@tanstack/react-query';

import type { InboxItem, InboxPage } from '@/features/notification-centre/types';

type InboxData = InfiniteData<InboxPage, string | null>;

function mapItems(
  data: InboxData | undefined,
  next: (item: InboxItem) => InboxItem,
): InboxData | undefined {
  if (!data)
    return data;
  let changed = false;
  const pages = data.pages.map((page) => {
    let pageChanged = false;
    const items = page.items.map((item) => {
      const updated = next(item);
      if (updated !== item)
        pageChanged = true;
      return updated;
    });
    if (!pageChanged)
      return page;
    changed = true;
    return { ...page, items };
  });
  return changed ? { ...data, pages } : data;
}

export function markItemRead(data: InboxData | undefined, id: string): InboxData | undefined {
  return mapItems(data, item => (item.id === id && item.unread ? { ...item, unread: false } : item));
}

export function markAllItemsRead(data: InboxData | undefined): InboxData | undefined {
  return mapItems(data, item => (item.unread ? { ...item, unread: false } : item));
}
