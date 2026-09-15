import type { MemberContentScope } from '@/features/member-content/types';

import { useQuery } from '@tanstack/react-query';

import { NOTIFICATION_CENTRE_QUERY_ROOT } from '@/features/notification-centre/types';
import { client } from '@/lib/api/client';

export function inboxBadgeQueryKey(scope: MemberContentScope) {
  return [NOTIFICATION_CENTRE_QUERY_ROOT, scope.organizationId, scope.memberId, 'badge'] as const;
}

export async function fetchInboxBadge(organizationId: string): Promise<number> {
  const { data } = await client.get<{ count?: number }>('/api/inbox/badge-count', {
    params: { organizationId },
  });
  return typeof data?.count === 'number' ? Math.max(0, data.count) : 0;
}

export function useInboxBadge(scope: MemberContentScope) {
  return useQuery({
    queryKey: inboxBadgeQueryKey(scope),
    queryFn: () => fetchInboxBadge(scope.organizationId),
    enabled: Boolean(scope.memberId),
  });
}
