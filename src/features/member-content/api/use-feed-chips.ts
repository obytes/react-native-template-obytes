import type { FeedChipsResult, MemberContentScope } from '@/features/member-content/types';

import { useQuery } from '@tanstack/react-query';

import { MEMBER_CONTENT_QUERY_ROOT } from '@/features/member-content/types';
import { client } from '@/lib/api/client';
import { getItem, setItem } from '@/lib/storage';

function snapshotKey(scope: MemberContentScope) {
  return `feed-chips-snapshot:${scope.organizationId}:${scope.memberId}`;
}

export async function fetchFeedChips(scope: MemberContentScope): Promise<FeedChipsResult> {
  const { data } = await client.get<FeedChipsResult>('/api/community/feed-chips', {
    params: { organizationId: scope.organizationId },
  });
  if (data.ok !== true) {
    throw new Error('Feed chips unavailable');
  }
  void setItem(snapshotKey(scope), data);
  return data;
}

export function feedChipsQueryKey(scope: MemberContentScope) {
  return [MEMBER_CONTENT_QUERY_ROOT, 'chips', scope.organizationId, scope.memberId] as const;
}

export function useFeedChips(scope: MemberContentScope) {
  return useQuery({
    queryKey: feedChipsQueryKey(scope),
    queryFn: () => fetchFeedChips(scope),
    // Offline-first: last good response hydrates immediately.
    initialData: () => getItem<FeedChipsResult>(snapshotKey(scope)) ?? undefined,
    initialDataUpdatedAt: 0,
  });
}
