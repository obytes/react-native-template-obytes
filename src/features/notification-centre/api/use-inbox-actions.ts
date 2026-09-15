import type { InfiniteData } from '@tanstack/react-query';

import type { MemberContentScope } from '@/features/member-content/types';
import type { InboxPage } from '@/features/notification-centre/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inboxQueryKey } from '@/features/notification-centre/api/use-inbox';
import { inboxBadgeQueryKey } from '@/features/notification-centre/api/use-inbox-badge';
import { markAllItemsRead, markItemRead } from '@/features/notification-centre/lib/inbox-cache';
import { clearNotificationBadgeCount } from '@/features/notifications/badge';
import { client } from '@/lib/api/client';

type InboxData = InfiniteData<InboxPage, string | null>;

export function useMarkRead(scope: MemberContentScope) {
  const queryClient = useQueryClient();
  const key = inboxQueryKey(scope);
  return useMutation({
    mutationFn: async (id: string) => {
      await client.post('/api/inbox/read', { organizationId: scope.organizationId, id });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InboxData>(key);
      queryClient.setQueryData<InboxData>(key, current => markItemRead(current, id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
  });
}

export function useMarkAllRead(scope: MemberContentScope) {
  const queryClient = useQueryClient();
  const key = inboxQueryKey(scope);
  return useMutation({
    mutationFn: async () => {
      await client.post('/api/inbox/read-all', { organizationId: scope.organizationId });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InboxData>(key);
      queryClient.setQueryData<InboxData>(key, current => markAllItemsRead(current));
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
  });
}

export function useMarkSeen(scope: MemberContentScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.post('/api/inbox/seen', { organizationId: scope.organizationId });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: inboxBadgeQueryKey(scope) });
      queryClient.setQueryData(inboxBadgeQueryKey(scope), 0);
      void clearNotificationBadgeCount();
    },
    onSuccess: () => {
      queryClient.setQueryData(inboxBadgeQueryKey(scope), 0);
      void clearNotificationBadgeCount();
    },
  });
}
