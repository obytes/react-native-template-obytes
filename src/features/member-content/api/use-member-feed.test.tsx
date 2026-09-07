import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { useMemberFeed } from '@/features/member-content/api/use-member-feed';
import { client } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({ client: { get: jest.fn() } }));
jest.mock('@/features/member-content/cache/member-content-cache', () => ({
  MEMBER_CONTENT_CACHE_TTL_MS: 1000,
  getCachedMemberFeed: jest.fn(() => null),
  setCachedMemberFeed: jest.fn(),
}));

const mockGet = client.get as jest.MockedFunction<typeof client.get>;
const SCOPE = { organizationId: 'org-1', memberId: 'member-1' };

const ITEM = {
  id: 'post-1',
  spaceId: 'space-1',
  kind: 'post' as const,
  title: 'Update',
  excerpt: null,
  createdAt: null,
  spaceName: null,
  authorName: null,
  commentCount: 0,
  likeCount: 0,
  isLiked: false,
  imageUrl: null,
  url: null,
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useMemberFeed filtering', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends no filter params and keys the query with an empty filter segment', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, items: [ITEM], page: 1, hasNextPage: false } });
    const { queryClient, wrapper: localWrapper } = makeWrapper();
    const { result } = renderHook(() => useMemberFeed(SCOPE), { wrapper: localWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/api/circle/member-feed', {
      params: { organizationId: 'org-1', page: 1, perPage: 15 },
    });
    const [query] = queryClient.getQueryCache().findAll();
    expect(query.queryKey.at(-1)).toBe('');
  });

  it('sends flat filterSpaceIds as a comma-joined string and keys the query by it', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, items: [ITEM], page: 1, hasNextPage: false } });
    const { queryClient, wrapper: localWrapper } = makeWrapper();
    const { result } = renderHook(
      () => useMemberFeed(SCOPE, { spaceIds: ['1', '2'] }),
      { wrapper: localWrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/api/circle/member-feed', {
      params: { organizationId: 'org-1', page: 1, perPage: 15, filterSpaceIds: '1,2' },
    });
    const [query] = queryClient.getQueryCache().findAll();
    expect(query.queryKey.at(-1)).toBe('spaces=1,2');
  });

  it('sends filterKind for a poll filter', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, items: [], page: 1, hasNextPage: false } });
    const { result } = renderHook(() => useMemberFeed(SCOPE, { kind: 'poll' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/api/circle/member-feed', {
      params: { organizationId: 'org-1', page: 1, perPage: 15, filterKind: 'poll' },
    });
  });

  it('sends filterKind and filterCategory for a charity story filter', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, items: [], page: 1, hasNextPage: false } });
    const { result } = renderHook(
      () => useMemberFeed(SCOPE, { kind: 'story', category: 'charity' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/api/circle/member-feed', {
      params: {
        organizationId: 'org-1',
        page: 1,
        perPage: 15,
        filterKind: 'story',
        filterCategory: 'charity',
      },
    });
  });

  it('does not read the snapshot for a filtered feed', async () => {
    const { getCachedMemberFeed } = jest.requireMock(
      '@/features/member-content/cache/member-content-cache',
    ) as { getCachedMemberFeed: jest.Mock };
    mockGet.mockResolvedValue({ data: { ok: true, items: [ITEM], page: 1, hasNextPage: false } });
    const { result } = renderHook(() => useMemberFeed(SCOPE, { kind: 'poll' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCachedMemberFeed).not.toHaveBeenCalled();
  });

  it('reads the snapshot for the unfiltered feed', async () => {
    const { getCachedMemberFeed } = jest.requireMock(
      '@/features/member-content/cache/member-content-cache',
    ) as { getCachedMemberFeed: jest.Mock };
    mockGet.mockResolvedValue({ data: { ok: true, items: [ITEM], page: 1, hasNextPage: false } });
    const { result } = renderHook(() => useMemberFeed(SCOPE), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCachedMemberFeed).toHaveBeenCalledWith(SCOPE);
  });
});
