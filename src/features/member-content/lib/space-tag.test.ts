import { formatRelativeTime, SPACE_TAG_CLASS, spaceTagTone } from '@/features/member-content/lib/space-tag';

describe('spaceTagTone', () => {
  it('maps racing to sage, new to racing to ice, everything else to cream', () => {
    expect(spaceTagTone('Racing')).toBe('sage');
    expect(spaceTagTone('  racing ')).toBe('sage');
    expect(spaceTagTone('New to racing')).toBe('ice');
    expect(spaceTagTone('Lifestyle')).toBe('cream');
    expect(spaceTagTone(null)).toBe('cream');
  });

  it('has a class for every tone', () => {
    expect(SPACE_TAG_CLASS.sage).toBe('bg-sage');
    expect(SPACE_TAG_CLASS.ice).toBe('bg-ice');
    expect(SPACE_TAG_CLASS.cream).toBe('bg-secondary-container');
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
