import type {
  FeedFilter,
  MemberContentScope,
  MemberContentState,
  MemberFeedItem,
  MemberFeedResult,
} from '@/features/member-content/types';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import {
  getCachedMemberFeed,
  MEMBER_CONTENT_CACHE_TTL_MS,
  setCachedMemberFeed,
} from '@/features/member-content/cache/member-content-cache';
import { filterKeyPart } from '@/features/member-content/lib/chip-filter';
import { MEMBER_CONTENT_QUERY_ROOT } from '@/features/member-content/types';
import { client } from '@/lib/api/client';

const FEED_LIMIT = 15;

function filterParams(filter?: FeedFilter): Record<string, string> {
  if (!filter) {
    return {};
  }
  const params: Record<string, string> = {};
  if (filter.kind) {
    params.filterKind = filter.kind;
  }
  if (filter.category) {
    params.filterCategory = filter.category;
  }
  if (filter.spaceIds && filter.spaceIds.length > 0) {
    params.filterSpaceIds = filter.spaceIds.join(',');
  }
  return params;
}

type MemberFeedStateInput = {
  data: MemberFeedItem[] | undefined;
  isError: boolean;
};

export function resolveMemberFeedContentState({
  data,
  isError,
}: MemberFeedStateInput): MemberContentState {
  if (isError) {
    return data ? 'saved' : 'unavailable';
  }
  if (!data) {
    return 'unavailable';
  }
  if (data.length === 0) {
    return 'empty';
  }
  return 'fresh';
}

export async function fetchMemberFeed(
  scope: MemberContentScope,
  filter?: FeedFilter,
): Promise<MemberFeedItem[]> {
  const { data } = await client.get<MemberFeedResult>('/api/circle/member-feed', {
    params: {
      organizationId: scope.organizationId,
      page: 1,
      perPage: FEED_LIMIT,
      ...filterParams(filter),
    },
  });
  if (data.ok !== true || !Array.isArray(data.items)) {
    throw new Error('Member feed unavailable');
  }
  return data.items.slice(0, FEED_LIMIT);
}

export function useMemberFeed(scope: MemberContentScope, filter?: FeedFilter) {
  const { memberId, organizationId } = scope;
  const keyPart = filterKeyPart(filter);
  const isFiltered = keyPart !== '';
  const cached = React.useMemo(
    () => (isFiltered ? undefined : getCachedMemberFeed({ memberId, organizationId })),
    [memberId, organizationId, isFiltered],
  );
  const query = useQuery({
    queryKey: [
      MEMBER_CONTENT_QUERY_ROOT,
      'feed',
      organizationId,
      memberId,
      keyPart,
    ],
    queryFn: () => fetchMemberFeed({ memberId, organizationId }, filter),
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.fetchedAt,
    staleTime: 0,
    gcTime: MEMBER_CONTENT_CACHE_TTL_MS,
    networkMode: 'offlineFirst',
  });

  React.useEffect(() => {
    if (!isFiltered && query.isFetchedAfterMount && query.isSuccess && query.data) {
      setCachedMemberFeed({ memberId, organizationId }, query.data, query.dataUpdatedAt);
    }
  }, [
    query.data,
    query.dataUpdatedAt,
    query.isFetchedAfterMount,
    query.isSuccess,
    memberId,
    organizationId,
    isFiltered,
  ]);

  const contentState = resolveMemberFeedContentState({
    data: query.data,
    isError: query.isError,
  });

  return {
    ...query,
    contentState,
    savedAt: contentState === 'saved'
      ? (cached?.fetchedAt ?? query.dataUpdatedAt ?? null)
      : null,
  };
}
