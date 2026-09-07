import type { FeedChip, FeedFilter } from '@/features/member-content/types';
import type { AuthUser } from '@/lib/auth/utils';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import {
  CommunityFeedScreen,
  CommunityFeedView,
} from '@/features/member-content/screens/community-feed-screen';

jest.mock('@/components/ui', () => {
  const RN = jest.requireActual('react-native');
  return {
    Image: 'Image',
    Pressable: RN.Pressable,
    Text: RN.Text,
    View: RN.View,
  };
});

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
}));

jest.mock('@/components/ui/tab-bar-layout', () => ({
  useTabBarContentPadding: () => 120,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: {
    use: {
      user: () => ({ id: 'member-1', email: 'jane@example.com', name: 'Jane Member' }),
    },
  },
}));

jest.mock('@/features/community-posting/components/new-post-button', () => ({
  NewPostButton: () => null,
}));

jest.mock('@/features/member-content/api/use-post-like', () => ({
  usePostLike: () => ({ toggleLike: jest.fn(), pendingPostId: null }),
}));

jest.mock('@/features/polls/api/use-poll-vote', () => ({
  usePollVote: () => ({ vote: jest.fn(), pendingPollIds: [] }),
}));

const mockUseFeedChips = jest.fn();
jest.mock('@/features/member-content/api/use-feed-chips', () => ({
  useFeedChips: (...args: unknown[]) => mockUseFeedChips(...args),
}));

const mockUseMemberFeed = jest.fn();
jest.mock('@/features/member-content/api/use-member-feed', () => ({
  useMemberFeed: (...args: unknown[]) => mockUseMemberFeed(...args),
}));

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
jest.mock('@/lib/storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const MEMBER: AuthUser = {
  id: 'member-1',
  email: 'jane@example.com',
  name: 'Jane Member',
};

const ITEM = {
  id: 'post-1',
  spaceId: 'space-1',
  kind: 'post' as const,
  title: 'Laska morning update',
  excerpt: 'A steady piece of work on the gallops.',
  createdAt: '2026-07-13T08:00:00.000Z',
  spaceName: 'Laska',
  authorName: 'Rionna Racing',
  commentCount: 2,
  likeCount: 5,
  isLiked: false,
  imageUrl: null,
  url: null,
};

const BASE_PROPS = {
  member: MEMBER,
  items: [ITEM],
  contentState: 'fresh' as const,
  isLoading: false,
  isRefetching: false,
  onRefresh: jest.fn(),
  onOpenPost: jest.fn(),
  onOpenProfile: jest.fn(),
  onVote: jest.fn(),
  pendingVotePollIds: [],
  onOpenStory: jest.fn(),
};

const POLL_ITEM = {
  id: 'poll:p1',
  spaceId: null,
  kind: 'poll' as const,
  title: 'Which charity?',
  excerpt: null,
  createdAt: null,
  spaceName: null,
  authorName: null,
  commentCount: 0,
  likeCount: 0,
  isLiked: false,
  imageUrl: null,
  url: null,
  poll: {
    id: 'p1',
    question: 'Which charity?',
    scope: 'club' as const,
    circleSpaceId: null,
    status: 'open' as const,
    publishedAt: '2026-09-01T09:00:00.000Z',
    closesAt: null,
    options: [{ id: 'o1', label: 'A', sortOrder: 0 }, { id: 'o2', label: 'B', sortOrder: 1 }],
    myVoteOptionId: null,
    results: null,
  },
};

describe('communityFeedView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the live member feed and opens a native post', () => {
    render(<CommunityFeedView {...BASE_PROPS} />);

    expect(screen.getByText('Laska morning update')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Laska morning update' }));
    expect(BASE_PROPS.onOpenPost).toHaveBeenCalledWith('space-1', 'post-1');
  });

  it('labels cached content without hiding the saved feed', () => {
    render(<CommunityFeedView {...BASE_PROPS} contentState="saved" />);

    expect(screen.getByText('Showing saved content')).toBeOnTheScreen();
    expect(screen.getByText('Laska morning update')).toBeOnTheScreen();
  });

  it.each([
    ['loading', { ...BASE_PROPS, items: undefined, isLoading: true }],
    ['empty', { ...BASE_PROPS, items: [], contentState: 'empty' as const }],
    ['unavailable', { ...BASE_PROPS, items: undefined, contentState: 'unavailable' as const }],
  ])('renders the %s state', (_name, props) => {
    render(<CommunityFeedView {...props} />);
    expect(screen.getByTestId(`member-feed-${_name}`)).toBeOnTheScreen();
  });

  it('opens the profile from the avatar', () => {
    render(<CommunityFeedView {...BASE_PROPS} />);

    fireEvent.press(screen.getByRole('button', { name: 'Open profile' }));
    expect(BASE_PROPS.onOpenProfile).toHaveBeenCalledTimes(1);
  });

  it('renders kind:poll items with the poll question', () => {
    render(<CommunityFeedView {...BASE_PROPS} items={[ITEM, POLL_ITEM]} />);

    expect(screen.getByText('Which charity?')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('poll-option-o2'));
    expect(BASE_PROPS.onVote).toHaveBeenCalledWith('p1', 'o2');
  });
});

const CHIPS: FeedChip[] = [
  { id: 'all', label: 'All', kind: 'all', spaceIds: [] },
  { id: 'polls', label: 'Polls', kind: 'polls', spaceIds: [] },
];

function feedResult(overrides: Record<string, unknown> = {}) {
  return {
    data: [ITEM],
    contentState: 'fresh' as const,
    isLoading: false,
    isRefetching: false,
    isError: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('signedInCommunityFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockReturnValue(null);
    mockUseFeedChips.mockReturnValue({ data: { ok: true, chips: CHIPS }, isError: false, isLoading: false });
    mockUseMemberFeed.mockReturnValue(feedResult());
  });

  it('queries the feed with the filter for the selected chip', () => {
    render(<CommunityFeedScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Polls' }));

    const lastCall = mockUseMemberFeed.mock.calls[mockUseMemberFeed.mock.calls.length - 1];
    const filter = lastCall[1] as FeedFilter | undefined;
    expect(filter).toEqual({ kind: 'poll' });
  });

  it('shows the polls empty copy when the polls chip has no items', () => {
    mockUseMemberFeed.mockReturnValue(feedResult({ data: [], contentState: 'empty' }));

    render(<CommunityFeedScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Polls' }));

    expect(screen.getByText('No polls right now')).toBeOnTheScreen();
  });

  it('hides the chip row while chips are loading with nothing cached', () => {
    mockUseFeedChips.mockReturnValue({ data: undefined, isError: false, isLoading: true });

    render(<CommunityFeedScreen />);

    expect(screen.queryByRole('button', { name: 'All' })).not.toBeOnTheScreen();
  });

  it('hides the chip row when the chips query errored', () => {
    mockUseFeedChips.mockReturnValue({ data: undefined, isError: true, isLoading: false });

    render(<CommunityFeedScreen />);

    expect(screen.queryByRole('button', { name: 'All' })).not.toBeOnTheScreen();
    expect(screen.getByText('Laska morning update')).toBeOnTheScreen();
  });
});
