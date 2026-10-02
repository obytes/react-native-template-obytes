import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { SpaceFeedView } from '@/features/member-content/screens/space-feed-screen';

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
  useScreenBottomPadding: () => 34,
}));

const ITEM = {
  id: 'post-9',
  spaceId: 'space-9',
  kind: 'post' as const,
  title: 'Laska schooling session',
  excerpt: 'Jumped a full course this morning.',
  createdAt: '2026-07-23T08:00:00.000Z',
  spaceName: 'Laska',
  authorName: 'Rionna Racing',
  commentCount: 3,
  likeCount: 7,
  isLiked: false,
  imageUrl: null,
  url: null,
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

const BASE_PROPS = {
  title: 'Laska du Breuil',
  items: [ITEM],
  contentState: 'fresh' as const,
  isLoading: false,
  isRefetching: false,
  onRefresh: jest.fn(),
  onOpenPost: jest.fn(),
  onVote: jest.fn(),
  pendingVotePollIds: [],
  onOpenStory: jest.fn(),
};

describe('spaceFeedView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the horse title and its posts, and opens a post natively', () => {
    render(<SpaceFeedView {...BASE_PROPS} />);

    expect(screen.getByText('Laska du Breuil')).toBeOnTheScreen();
    expect(screen.getByText('Laska schooling session')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Laska schooling session' }));
    expect(BASE_PROPS.onOpenPost).toHaveBeenCalledWith('space-9', 'post-9');
  });

  it.each([
    ['loading', { ...BASE_PROPS, items: undefined, isLoading: true }],
    ['empty', { ...BASE_PROPS, items: [], contentState: 'empty' as const }],
    ['unavailable', { ...BASE_PROPS, items: undefined, contentState: 'unavailable' as const }],
  ])('renders the %s state', (_name, props) => {
    render(<SpaceFeedView {...props} />);
    expect(screen.getByTestId(`space-feed-${_name}`)).toBeOnTheScreen();
  });

  it('renders kind:poll items with the poll question and votes', () => {
    render(<SpaceFeedView {...BASE_PROPS} items={[ITEM, POLL_ITEM]} />);

    expect(screen.getByText('Which charity?')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('poll-option-o2'));
    expect(BASE_PROPS.onVote).toHaveBeenCalledWith('p1', 'o2');
  });
});
