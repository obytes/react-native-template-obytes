import type { FeedChip } from '@/features/member-content/types';

import { act, renderHook } from '@testing-library/react-native';

import { useFeedChipSelection } from '@/features/member-content/lib/use-feed-chip-selection';
import { getItem, setItem } from '@/lib/storage';

jest.mock('@/lib/storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));

const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

const SCOPE = { organizationId: 'org-1', memberId: 'member-1' };
const CHIPS: FeedChip[] = [
  { id: 'all', label: 'All', kind: 'all', spaceIds: [] },
  { id: 'polls', label: 'Polls', kind: 'polls', spaceIds: [] },
];

describe('useFeedChipSelection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('defaults to "all" when nothing is stored', () => {
    mockGetItem.mockReturnValue(null);
    const { result } = renderHook(() => useFeedChipSelection(SCOPE, CHIPS));
    expect(result.current.selectedId).toBe('all');
    expect(result.current.selectedChip).toEqual(CHIPS[0]);
  });

  it('initialises from the stored chip id for this member', () => {
    mockGetItem.mockReturnValue('polls');
    const { result } = renderHook(() => useFeedChipSelection(SCOPE, CHIPS));
    expect(mockGetItem).toHaveBeenCalledWith('community-feed:chip:member-1');
    expect(result.current.selectedId).toBe('polls');
  });

  it('resets to "all" when the stored id is no longer in the chip list', () => {
    mockGetItem.mockReturnValue('gone');
    const { result } = renderHook(() => useFeedChipSelection(SCOPE, CHIPS));
    expect(result.current.selectedId).toBe('all');
  });

  it('persists the selection when select is called', () => {
    mockGetItem.mockReturnValue(null);
    const { result } = renderHook(() => useFeedChipSelection(SCOPE, CHIPS));

    act(() => result.current.select('polls'));

    expect(result.current.selectedId).toBe('polls');
    expect(result.current.selectedChip).toEqual(CHIPS[1]);
    expect(mockSetItem).toHaveBeenCalledWith('community-feed:chip:member-1', 'polls');
  });
});
