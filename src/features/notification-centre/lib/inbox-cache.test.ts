import type { InfiniteData } from '@tanstack/react-query';

import type { InboxItem, InboxPage } from '@/features/notification-centre/types';

import { markAllItemsRead, markItemRead } from '@/features/notification-centre/lib/inbox-cache';

function item(id: string, unread = true): InboxItem {
  return {
    id,
    kind: 'news',
    icon: 'club',
    title: id,
    body: '',
    imageUrl: null,
    actorAvatarUrl: null,
    data: { screen: 'insideTrack' },
    unread,
    updatedAt: '2026-09-15T10:00:00.000Z',
  };
}

function data(pages: InboxItem[][]): InfiniteData<InboxPage, string | null> {
  return {
    pages: pages.map(items => ({ items, nextCursor: null })),
    pageParams: pages.map(() => null),
  };
}

describe('markItemRead', () => {
  it('marks only the matching item read across pages', () => {
    const before = data([[item('a'), item('b')], [item('c')]]);
    const after = markItemRead(before, 'c');
    expect(after?.pages[1].items[0].unread).toBe(false);
    expect(after?.pages[0].items.every(i => i.unread)).toBe(true);
    expect(after?.pages[0]).toBe(before.pages[0]);
  });

  it('returns the same object when nothing changes', () => {
    const before = data([[item('a', false)]]);
    expect(markItemRead(before, 'a')).toBe(before);
    expect(markItemRead(before, 'zzz')).toBe(before);
    expect(markItemRead(undefined, 'a')).toBeUndefined();
  });
});

describe('markAllItemsRead', () => {
  it('marks every item read', () => {
    const after = markAllItemsRead(data([[item('a')], [item('b')]]));
    expect(after?.pages.flatMap(p => p.items).every(i => !i.unread)).toBe(true);
  });

  it('returns the same object when all are already read', () => {
    const before = data([[item('a', false)]]);
    expect(markAllItemsRead(before)).toBe(before);
  });
});
