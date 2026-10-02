import type { FeedChip, MemberFeedItem } from '@/features/member-content/types';

import { announcementSpaceIdsFromChips, selectAnnouncements } from '@/features/member-content/lib/announcements';

function post(overrides: Partial<MemberFeedItem>): MemberFeedItem {
  return {
    id: 'p',
    spaceId: 's',
    kind: 'post',
    title: 'T',
    excerpt: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    spaceName: 'Racing',
    authorName: null,
    commentCount: 0,
    likeCount: 0,
    isLiked: false,
    imageUrl: null,
    url: null,
    ...overrides,
  };
}

describe('selectAnnouncements', () => {
  it('returns [] when there is nothing', () => {
    expect(selectAnnouncements(undefined)).toEqual([]);
    expect(selectAnnouncements([post({})])).toEqual([]);
  });

  it('matches by known space id, space name, or isAnnouncement', () => {
    const items = [
      post({ id: 'a', spaceId: 'ann' }),
      post({ id: 'b', spaceId: 'x', spaceName: 'Official Announcements' }),
      post({ id: 'c', spaceId: 'y', isAnnouncement: true }),
      post({ id: 'd', spaceId: 'z' }),
    ];
    const ids = selectAnnouncements(items, ['ann']).map(i => i.id);
    expect(ids.toSorted()).toEqual(['a', 'b', 'c']);
  });

  it('sorts newest first, caps the count and skips polls and unopenable posts', () => {
    const items = [
      post({ id: 'old', isAnnouncement: true, createdAt: '2026-01-01T00:00:00.000Z' }),
      post({ id: 'new', isAnnouncement: true, createdAt: '2026-09-01T00:00:00.000Z' }),
      post({ id: 'nospace', isAnnouncement: true, spaceId: null }),
      post({ id: 'poll', isAnnouncement: true, kind: 'poll' }),
    ];
    expect(selectAnnouncements(items).map(i => i.id)).toEqual(['new', 'old']);
    expect(selectAnnouncements(items, [], 1).map(i => i.id)).toEqual(['new']);
  });

  it('is false for an explicit isAnnouncement=false only when nothing else matches', () => {
    expect(selectAnnouncements([post({ isAnnouncement: false })])).toEqual([]);
  });
});

describe('announcementSpaceIdsFromChips', () => {
  it('collects space ids of announcement-named space chips', () => {
    const chips: FeedChip[] = [
      { id: 'all', label: 'All', kind: 'all', spaceIds: [] },
      { id: 'a', label: 'Announcements', kind: 'space', spaceIds: ['1', '2'] },
      { id: 'r', label: 'Racing', kind: 'space', spaceIds: ['3'] },
    ];
    expect(announcementSpaceIdsFromChips(chips)).toEqual(['1', '2']);
  });
});
