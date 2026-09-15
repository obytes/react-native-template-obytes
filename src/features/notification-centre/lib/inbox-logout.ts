import { INBOX_SNAPSHOT_PREFIX } from '@/features/notification-centre/api/use-inbox';
import { NOTIFICATION_CENTRE_QUERY_ROOT } from '@/features/notification-centre/types';
import { queryClient } from '@/lib/api/query-client';
import { removeItemsWithPrefix } from '@/lib/storage';

/**
 * Clear the notification centre's persisted state on sign-out: every offline
 * inbox snapshot MMKV entry (any member/org) and the in-memory React Query
 * cache under the notification centre root, so the next member to sign in on
 * this device never sees a previous member's cached inbox.
 */
export function clearInboxStorage(): void {
  removeItemsWithPrefix(INBOX_SNAPSHOT_PREFIX);
  queryClient.removeQueries({ queryKey: [NOTIFICATION_CENTRE_QUERY_ROOT] });
}
