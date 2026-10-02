import type { Horse, HorseStatus } from '@/features/stables/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import StablesTab from '@/app/(app)/stables';

const mockPush = jest.fn();
let mockParams: { filter?: string } = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image', FocusAwareStatusBar: () => null };
});

// FlashList doesn't lay out in jest; render the list as a plain map.
jest.mock('@/components/ui/list', () => {
  const { View } = jest.requireActual('react-native');
  return {
    List: ({ data, renderItem, ListHeaderComponent, ListEmptyComponent, keyExtractor }: any) => (
      <View>
        {ListHeaderComponent}
        {data.length === 0
          ? ListEmptyComponent
          : data.map((item: any, index: number) => <View key={keyExtractor(item)}>{renderItem({ item, index })}</View>)}
      </View>
    ),
  };
});

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 0,
}));

jest.mock('@/components/ui/tab-bar-layout', () => ({
  useTabBarContentPadding: () => 0,
}));

const mockToggleFollow = jest.fn();
jest.mock('@/features/stables/api/use-horse-follow', () => ({
  useFollowHorse: () => ({ toggleFollow: mockToggleFollow, pendingHorseId: null }),
}));

const mockUseHorses = jest.fn();
jest.mock('@/features/stables/api/use-horses', () => ({
  useHorses: () => mockUseHorses(),
}));

function horse([id, name, status, isFollowing = false]: [string, string, HorseStatus, boolean?]): Horse {
  return {
    id,
    organizationId: 'org-1',
    slug: id,
    name,
    status,
    isFollowing,
    inviteOnly: false,
    bio: null,
    trainerNotes: null,
    photos: [],
    pedigree: null,
    ownershipBlurb: null,
    circleSpaceId: null,
    trainerId: null,
    trainer: null,
    sortOrder: 0,
    publishedAt: '2026-01-01T00:00:00.000Z',
    latestEntryId: null,
    nextEntryId: null,
    providerEntityId: null,
    providerLastSync: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const HORSES = [
  horse(['a', 'Ashfield Rose', 'IN_TRAINING', true]),
  horse(['b', 'Midnight Tempo', 'IN_TRAINING']),
  horse(['c', 'Comeragh Star', 'PRE_TRAINING']),
];

function withHorses(data: Horse[] | undefined, extra: Record<string, unknown> = {}) {
  mockUseHorses.mockReturnValue({ data, isLoading: false, isError: false, refetch: jest.fn(), isRefetching: false, ...extra });
}

describe('stablesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
  });

  it('renders the header, All with a count, Following and present status chips', () => {
    withHorses(HORSES);
    render(<StablesTab />);

    expect(screen.getByText('Our Stables')).toBeOnTheScreen();
    expect(screen.getByText('Today at the yard')).toBeOnTheScreen();
    expect(screen.getByTestId('stables-filter-chips-all')).toBeSelected();
    expect(screen.getByTestId('stables-filter-chips-all-count')).toHaveTextContent('3');
    expect(screen.getByTestId('stables-filter-chips-following')).toBeOnTheScreen();
    expect(screen.getByTestId('stables-filter-chips-PRE_TRAINING')).toBeOnTheScreen();
    expect(screen.getByTestId('stables-filter-chips-IN_TRAINING')).toBeOnTheScreen();
    expect(screen.queryByTestId('stables-filter-chips-REHAB')).toBeNull();
    expect(screen.queryByTestId('stables-filter-chips-RETIRED')).toBeNull();
    expect(screen.getAllByTestId(/^horse-card-[abc]$/)).toHaveLength(3);
  });

  it('filters by status and by following', () => {
    withHorses(HORSES);
    render(<StablesTab />);

    fireEvent.press(screen.getByTestId('stables-filter-chips-PRE_TRAINING'));
    expect(screen.getByText('Comeragh Star')).toBeOnTheScreen();
    expect(screen.queryByText('Midnight Tempo')).toBeNull();

    fireEvent.press(screen.getByTestId('stables-filter-chips-following'));
    expect(screen.getByText('Ashfield Rose')).toBeOnTheScreen();
    expect(screen.queryByText('Comeragh Star')).toBeNull();
  });

  it('preselects Following from ?filter=following', () => {
    mockParams = { filter: 'following' };
    withHorses(HORSES);
    render(<StablesTab />);

    expect(screen.getByTestId('stables-filter-chips-following')).toBeSelected();
    expect(screen.getByText('Ashfield Rose')).toBeOnTheScreen();
    expect(screen.queryByText('Midnight Tempo')).toBeNull();
  });

  it('re-applies the param when it changes while the tab is mounted', () => {
    withHorses(HORSES);
    const { rerender } = render(<StablesTab />);
    expect(screen.getByTestId('stables-filter-chips-all')).toBeSelected();

    mockParams = { filter: 'following' };
    rerender(<StablesTab />);
    expect(screen.getByTestId('stables-filter-chips-following')).toBeSelected();
  });

  it('ignores unknown filter params', () => {
    mockParams = { filter: 'bogus' };
    withHorses(HORSES);
    render(<StablesTab />);
    expect(screen.getByTestId('stables-filter-chips-all')).toBeSelected();
  });

  it('shows a following-specific empty state', () => {
    mockParams = { filter: 'following' };
    withHorses([horse(['b', 'Midnight Tempo', 'IN_TRAINING'])]);
    render(<StablesTab />);
    expect(screen.getByTestId('stables-empty-following')).toBeOnTheScreen();
  });

  it('opens the horse on card press', () => {
    withHorses(HORSES);
    render(<StablesTab />);
    fireEvent.press(screen.getByTestId('horse-card-b'));
    expect(mockPush).toHaveBeenCalledWith('/stables/b');
  });

  it('shows the empty state with no horses and the error state with retry', () => {
    withHorses([]);
    const { rerender } = render(<StablesTab />);
    expect(screen.getByTestId('stables-empty')).toBeOnTheScreen();

    const refetch = jest.fn();
    withHorses(undefined, { isError: true, refetch });
    rerender(<StablesTab />);
    fireEvent.press(screen.getByText('Try again'));
    expect(refetch).toHaveBeenCalled();
  });
});
