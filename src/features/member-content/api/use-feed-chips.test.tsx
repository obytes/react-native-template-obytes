import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { useFeedChips } from '@/features/member-content/api/use-feed-chips';
import { client } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({ client: { get: jest.fn() } }));
jest.mock('@/lib/storage', () => ({ getItem: jest.fn(() => null), setItem: jest.fn() }));

const mockGet = client.get as jest.MockedFunction<typeof client.get>;
const SCOPE = { organizationId: 'org-1', memberId: 'member-1' };

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useFeedChips', () => {
  it('fetches the derived feed chips for the club', async () => {
    const chips = [
      { id: 'all', label: 'All', kind: 'all' as const, spaceIds: [] },
      { id: 'horses', label: 'Horses', kind: 'horses' as const, spaceIds: ['sp1', 'sp2'] },
    ];
    mockGet.mockResolvedValue({ data: { ok: true, chips } });
    const { result } = renderHook(() => useFeedChips(SCOPE), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith('/api/community/feed-chips', {
      params: { organizationId: 'org-1' },
    });
    expect(result.current.data).toEqual({ ok: true, chips });
  });

  it('errors when the backend reports ok:false', async () => {
    mockGet.mockResolvedValue({ data: { ok: false, chips: [] } });
    const { result } = renderHook(() => useFeedChips(SCOPE), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
