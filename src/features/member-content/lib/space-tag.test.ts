import { formatRelativeTime, horseSpaceIds, SPACE_TAG_CLASS, spaceTagTone } from '@/features/member-content/lib/space-tag';

describe('spaceTagTone', () => {
  const horses = new Set(['h1']);
  it('classifies horse spaces from the feed-chip ids, regardless of name', () => {
    expect(spaceTagTone('Gooloogong', 'h1', horses)).toBe('horses');
    expect(spaceTagTone('My Boy Harry', 'h1', horses)).toBe('horses');
    expect(spaceTagTone('Gooloogong', 'x', horses)).toBe('unknown');
  });
  it('falls back to name heuristics for the other categories', () => {
    expect(spaceTagTone('Official Announcements')).toBe('official');
    expect(spaceTagTone('Racing News')).toBe('news');
    expect(spaceTagTone('Charity')).toBe('charity');
    expect(spaceTagTone('Polls')).toBe('polls');
    expect(spaceTagTone('Introduce Yourself')).toBe('community');
    expect(spaceTagTone('Networking')).toBe('community');
    expect(spaceTagTone('  New to racing ')).toBe('community');
    expect(spaceTagTone('Lifestyle')).toBe('community');
  });
  it('falls back to unknown', () => {
    expect(spaceTagTone('Gooloogong')).toBe('unknown');
    expect(spaceTagTone(null)).toBe('unknown');
  });
  it('has fill and text classes for every tone', () => {
    expect(SPACE_TAG_CLASS.horses).toEqual({ container: 'bg-sage', text: 'text-forest' });
    expect(SPACE_TAG_CLASS.official).toEqual({ container: 'bg-primary', text: 'text-white' });
    expect(SPACE_TAG_CLASS.news).toEqual({ container: 'bg-ice', text: 'text-ink' });
    expect(SPACE_TAG_CLASS.charity).toEqual({ container: 'bg-forest/15', text: 'text-forest' });
    expect(SPACE_TAG_CLASS.polls).toEqual({ container: 'bg-primary-fixed', text: 'text-plum' });
    expect(SPACE_TAG_CLASS.community).toEqual({ container: 'bg-primary-fixed/50', text: 'text-plum-mid' });
    expect(SPACE_TAG_CLASS.unknown).toEqual({ container: 'bg-secondary-container', text: 'text-ink-variant' });
  });
});

describe('horseSpaceIds', () => {
  it('collects ids from the horses chip only', () => {
    const chips = [
      { id: 'a', label: 'All', kind: 'all' as const, spaceIds: [] },
      { id: 'h', label: 'Horses', kind: 'horses' as const, spaceIds: ['h1', 'h2'] },
      { id: 's', label: 'Networking', kind: 'space' as const, spaceIds: ['n1'] },
    ];
    expect([...horseSpaceIds(chips)]).toEqual(['h1', 'h2']);
    expect(horseSpaceIds(undefined).size).toBe(0);
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-02T12:00:00.000Z');
  it('formats minutes, hours and days', () => {
    expect(formatRelativeTime('2026-10-02T11:59:50.000Z', now)).toBe('Just now');
    expect(formatRelativeTime('2026-10-02T11:30:00.000Z', now)).toBe('30m ago');
    expect(formatRelativeTime('2026-10-02T10:00:00.000Z', now)).toBe('2h ago');
    expect(formatRelativeTime('2026-09-30T12:00:00.000Z', now)).toBe('2d ago');
  });
  it('handles missing and invalid values', () => {
    expect(formatRelativeTime(null, now)).toBeNull();
    expect(formatRelativeTime('nope', now)).toBeNull();
  });
});
