import type { MemberContentScope } from '@/features/member-content/types';

import { useEvents } from '@/features/events/api/use-events';
import { useInsideTrack } from '@/features/member-content/api/use-inside-track';
import { useInboxBadge } from '@/features/notification-centre/api/use-inbox-badge';
import { useCharity } from '@/features/paddock/api/use-charity';
import { useLatestNews } from '@/features/pulse/api/use-latest-news';
import { useLatestResults } from '@/features/pulse/api/use-latest-results';
import { useNextRun } from '@/features/pulse/api/use-next-run';
import { useFollowedHorses } from '@/features/stables/api/use-followed-horses';

/**
 * Every Home query in one place (S13-03). The inbox badge is the same query
 * the header bell reads (shared key, one request); it's here so the Unread
 * chip can count it and pull-to-refresh refetches it.
 */
export function useHomeQueries(scope: MemberContentScope) {
  const queries = {
    nextRun: useNextRun(),
    results: useLatestResults(),
    news: useLatestNews(),
    followedHorses: useFollowedHorses(),
    insideTrack: useInsideTrack(scope),
    upcomingEvents: useEvents(scope, 'upcoming'),
    charity: useCharity(scope),
    inboxBadge: useInboxBadge(scope),
  };
  const all = Object.values(queries);
  return {
    ...queries,
    isRefetching: all.some(q => q.isRefetching),
    refetchAll: () => {
      for (const q of all) void q.refetch();
    },
  };
}
