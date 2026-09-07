import type { FeedChip, FeedFilter } from '@/features/member-content/types';

export function chipToFilter(chip: FeedChip): FeedFilter | undefined {
  switch (chip.kind) {
    case 'all':
      return undefined;
    case 'horses':
    case 'space':
      return { spaceIds: chip.spaceIds };
    case 'news':
      return { kind: 'story' };
    case 'charity':
      return { kind: 'story', category: 'charity' };
    case 'polls':
      return { kind: 'poll' };
    default:
      return undefined;
  }
}

export function filterKeyPart(filter?: FeedFilter): string {
  if (!filter) {
    return '';
  }
  const parts: string[] = [];
  if (filter.kind) {
    parts.push(`kind=${filter.kind}`);
  }
  if (filter.category) {
    parts.push(`cat=${filter.category}`);
  }
  if (filter.spaceIds && filter.spaceIds.length > 0) {
    parts.push(`spaces=${filter.spaceIds.join(',')}`);
  }
  return parts.join(',');
}
