import { tagForKind, tagSpecForKind } from '@/features/notification-centre/lib/kind-tag';

describe('tagForKind', () => {
  it.each([
    ['race_declared', 'racing'],
    ['race_non_runner', 'racing'],
    ['race_result', 'racing'],
    ['horse_update', 'updates'],
    ['horse_posts', 'updates'],
    ['post_like', 'community'],
    ['post_comment', 'community'],
    ['post_removed', 'community'],
    ['news', 'club'],
    ['announcement', 'club'],
    ['inside_track', 'club'],
    ['event', 'club'],
    ['poll', 'club'],
  ])('maps %s to %s', (kind, tag) => {
    expect(tagForKind(kind)).toBe(tag);
  });

  it('falls back to club for unknown kinds', () => {
    expect(tagForKind('something_new')).toBe('club');
    expect(tagForKind('')).toBe('club');
  });

  it('gives each tag its label and fill', () => {
    expect(tagSpecForKind('race_result')).toMatchObject({ label: 'Racing', boxClass: 'bg-sage' });
    expect(tagSpecForKind('horse_update')).toMatchObject({ label: 'Updates', boxClass: 'bg-ice' });
    expect(tagSpecForKind('post_like')).toMatchObject({ label: 'Community', boxClass: 'bg-primary-fixed' });
    expect(tagSpecForKind('news')).toMatchObject({ label: 'Club', boxClass: 'bg-secondary-container' });
  });
});
