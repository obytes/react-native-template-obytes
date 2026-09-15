import type { InfiniteData } from '@tanstack/react-query';

import type { InboxItem, InboxPage } from '@/features/notification-centre/types';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { inboxQueryKey } from '@/features/notification-centre/api/use-inbox';
import {
  useMarkAllRead,
  useMarkRead,
  useMarkSeen,
} from '@/features/notification-centre/api/use-inbox-actions';
import { inboxBadgeQueryKey } from '@/features/notification-centre/api/use-inbox-badge';
import { clearNotificationBadgeCount } from '@/features/notifications/badge';
import { client } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  client: { post: jest.fn() },
}));

jest.mock('@/features/notifications/badge', () => ({
  clearNotificationBadgeCount: jest.fn(() => Promise.resolve()),
}));

const mockPost = client.post as jest.MockedFunction<typeof client.post>;
const mockClearBadge = clearNotificationBadgeCount as jest.MockedFunction<
  typeof clearNotificationBadgeCount
>;

const SCOPE = { organizationId: 'org-1', memberId: 'member-1' };
const LIST_KEY = inboxQueryKey(SCOPE);
const BADGE_KEY = inboxBadgeQueryKey(SCOPE);

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function inboxItem(id: string, unread = true): InboxItem {
  return {
    id,
    kind: 'news',
    icon: 'club',
    title: id,
    body: '',
    imageUrl: null,
    actorAvatarUrl: null,
    data: { screen: 'insideTrack' },
    unread,
    updatedAt: '2026-09-15T10:00:00.000Z',
  };
}

function seededList(items: InboxItem[]): InfiniteData<InboxPage, string | null> {
  return { pages: [{ items, nextCursor: null }], pageParams: [null] };
}

function seededClient(items: InboxItem[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
  });
  queryClient.setQueryData(LIST_KEY, seededList(items));
  return queryClient;
}

describe('useMarkRead', () => {
  beforeEach(() => jest.clearAllMocks());

  it('patches the seeded list in place before the POST resolves and never invalidates', async () => {
    let resolvePost: (value: { data: unknown }) => void;
    mockPost.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const queryClient = seededClient([inboxItem('a'), inboxItem('b')]);
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useMarkRead(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate('a');

    await waitFor(() => expect(result.current.isPending).toBe(true));

    const data = queryClient.getQueryData<InfiniteData<InboxPage, string | null>>(LIST_KEY);
    expect(data?.pages[0].items[0].unread).toBe(false);
    expect(data?.pages[0].items[1].unread).toBe(true);
    expect(mockPost).toHaveBeenCalledWith('/api/inbox/read', {
      organizationId: SCOPE.organizationId,
      id: 'a',
    });

    resolvePost!({ data: {} });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('restores the previous list when the POST rejects', async () => {
    mockPost.mockRejectedValue(new Error('network down'));

    const queryClient = seededClient([inboxItem('a'), inboxItem('b')]);
    const before = queryClient.getQueryData(LIST_KEY);
    const { result } = renderHook(() => useMarkRead(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate('a');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(before);
  });
});

describe('useMarkAllRead', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marks every seeded item read and POSTs read-all', async () => {
    mockPost.mockResolvedValue({ data: {} });

    const queryClient = seededClient([inboxItem('a'), inboxItem('b')]);
    const { result } = renderHook(() => useMarkAllRead(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = queryClient.getQueryData<InfiniteData<InboxPage, string | null>>(LIST_KEY);
    expect(data?.pages[0].items.every(i => !i.unread)).toBe(true);
    expect(mockPost).toHaveBeenCalledWith('/api/inbox/read-all', {
      organizationId: SCOPE.organizationId,
    });
  });
});

describe('useMarkSeen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets the badge query data to 0, clears the badge and POSTs seen', async () => {
    mockPost.mockResolvedValue({ data: {} });

    const queryClient = seededClient([inboxItem('a')]);
    queryClient.setQueryData(BADGE_KEY, 5);
    const { result } = renderHook(() => useMarkSeen(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(BADGE_KEY)).toBe(0);
    expect(mockClearBadge).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith('/api/inbox/seen', {
      organizationId: SCOPE.organizationId,
    });
  });

  it('cancels an in-flight badge query before zeroing it', async () => {
    let resolvePost: (value: { data: unknown }) => void;
    mockPost.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const queryClient = seededClient([inboxItem('a')]);
    queryClient.setQueryData(BADGE_KEY, 5);
    const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');
    const { result } = renderHook(() => useMarkSeen(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: BADGE_KEY });
    expect(queryClient.getQueryData(BADGE_KEY)).toBe(0);

    resolvePost!({ data: {} });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('re-zeros the badge query on success even if a stale fetch overwrote it first', async () => {
    let resolvePost: (value: { data: unknown }) => void;
    mockPost.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const queryClient = seededClient([inboxItem('a')]);
    queryClient.setQueryData(BADGE_KEY, 5);
    const { result } = renderHook(() => useMarkSeen(SCOPE), { wrapper: wrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Simulate a stale in-flight badge fetch (e.g. foreground sync) landing
    // between onMutate zeroing the badge and the POST resolving.
    queryClient.setQueryData(BADGE_KEY, 5);

    resolvePost!({ data: {} });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(BADGE_KEY)).toBe(0);
    expect(mockClearBadge).toHaveBeenCalledTimes(2);
  });
});
