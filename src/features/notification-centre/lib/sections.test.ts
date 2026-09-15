import { groupInboxSections } from '@/features/notification-centre/lib/sections';

function at(iso: string, id: string) {
  return {
    id,
    kind: 'news',
    icon: 'club' as const,
    title: id,
    body: '',
    imageUrl: null,
    actorAvatarUrl: null,
    data: { screen: 'insideTrack' as const },
    unread: true,
    updatedAt: iso,
  };
}

describe('groupInboxSections', () => {
  const now = new Date(2026, 8, 15, 12, 0, 0); // local time

  it('splits into Today, This week and Earlier, omitting empty sections', () => {
    const items = [
      at(new Date(2026, 8, 15, 9, 0).toISOString(), 'today'),
      at(new Date(2026, 8, 14, 23, 0).toISOString(), 'yesterday'),
      at(new Date(2026, 8, 9, 13, 0).toISOString(), 'six-days'),
      at(new Date(2026, 8, 1, 10, 0).toISOString(), 'old'),
    ];
    expect(groupInboxSections(items, now).map(s => [s.title, s.data.map(i => i.id)])).toEqual([
      ['Today', ['today']],
      ['This week', ['yesterday', 'six-days']],
      ['Earlier', ['old']],
    ]);
    expect(groupInboxSections([items[3]], now).map(s => s.key)).toEqual(['earlier']);
    expect(groupInboxSections([], now)).toEqual([]);
  });
});
