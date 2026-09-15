import type { MemberContentScope } from '@/features/member-content/types';
import type { InboxPage } from '@/features/notification-centre/types';

import { useInfiniteQuery } from '@tanstack/react-query';

import { NOTIFICATION_CENTRE_QUERY_ROOT } from '@/features/notification-centre/types';
import { client } from '@/lib/api/client';
import { getItem, setItem } from '@/lib/storage';

export const INBOX_SNAPSHOT_PREFIX = 'inbox-snapshot:';

function snapshotKey(scope: MemberContentScope) {
  return `${INBOX_SNAPSHOT_PREFIX}${scope.organizationId}:${scope.memberId}`;
}

export function inboxQueryKey(scope: MemberContentScope) {
  return [NOTIFICATION_CENTRE_QUERY_ROOT, scope.organizationId, scope.memberId, 'list'] as const;
}

export async function fetchInboxPage(scope: MemberContentScope, cursor: string | null): Promise<InboxPage> {
  const { data } = await client.get<InboxPage>('/api/inbox', {
    params: { organizationId: scope.organizationId, ...(cursor ? { cursor } : {}) },
  });
  if (cursor === null)
    void setItem(snapshotKey(scope), data);
  return data;
}

export function useInbox(scope: MemberContentScope) {
  return useInfiniteQuery({
    queryKey: inboxQueryKey(scope),
    queryFn: ({ pageParam }) => fetchInboxPage(scope, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: last => last.nextCursor,
    enabled: Boolean(scope.memberId),
    // Offline-first: page 1 from the last good response; the network replaces it.
    initialData: () => {
      const page = getItem<InboxPage>(snapshotKey(scope));
      return page ? { pages: [page], pageParams: [null] } : undefined;
    },
    initialDataUpdatedAt: 0,
  });
}
