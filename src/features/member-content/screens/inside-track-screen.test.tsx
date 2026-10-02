import type { MemberFeedItem } from '@/features/member-content/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { InsideTrackView } from '@/features/member-content/screens/inside-track-screen';

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
  useScreenBottomPadding: () => 34,
}));

function feedItem(overrides: Partial<MemberFeedItem> = {}): MemberFeedItem {
  return {
    id: 'post-1',
    spaceId: 'space-1',
    kind: 'post',
    title: 'Post',
    excerpt: null,
    createdAt: null,
    spaceName: 'Inside Track',
    authorName: 'Jane',
    commentCount: 0,
    likeCount: 0,
    isLiked: false,
    imageUrl: null,
    url: null,
    ...overrides,
  };
}

const BASE_PROPS = {
  pinned: [] as MemberFeedItem[],
  latest: [] as MemberFeedItem[],
  contentState: 'fresh' as const,
  isLoading: false,
  isRefetching: false,
  onRefresh: jest.fn(),
  onOpenPost: jest.fn(),
};

describe('insideTrackView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders Start Here then Latest sections', () => {
    const pinned = feedItem({ id: 'pinned-1', spaceId: 'space-1', title: 'Pinned post' });
    const latest = feedItem({ id: 'latest-1', spaceId: 'space-1', title: 'Latest post' });

    render(<InsideTrackView {...BASE_PROPS} pinned={[pinned]} latest={[latest]} />);

    expect(screen.getByText('Start here')).toBeOnTheScreen();
    expect(screen.getByText('Latest')).toBeOnTheScreen();

    // Flatten all rendered text in document order and confirm the "Start
    // here" section (header + card) precedes the "Latest" section.
    const allText: string[] = [];
    const collect = (node: any) => {
      if (!node)
        return;
      if (typeof node === 'string') {
        allText.push(node);
        return;
      }
      const children = Array.isArray(node) ? node : node.children;
      children?.forEach(collect);
    };
    collect(screen.toJSON());

    const indexOf = (needle: string) => allText.findIndex(t => t === needle);
    expect(indexOf('Start here')).toBeGreaterThanOrEqual(0);
    expect(indexOf('Latest')).toBeGreaterThan(indexOf('Start here'));
    expect(indexOf('Pinned post')).toBeGreaterThan(indexOf('Start here'));
    expect(indexOf('Pinned post')).toBeLessThan(indexOf('Latest'));
    expect(indexOf('Latest post')).toBeGreaterThan(indexOf('Latest'));
  });

  it('shows the empty state when there is no content', () => {
    render(<InsideTrackView {...BASE_PROPS} contentState="empty" />);
    expect(screen.getByTestId('inside-track-empty')).toBeOnTheScreen();
  });

  it('shows the unavailable state on error', () => {
    render(<InsideTrackView {...BASE_PROPS} contentState="unavailable" />);
    expect(screen.getByTestId('inside-track-unavailable')).toBeOnTheScreen();
  });

  it('opens a post via the /post route', () => {
    const onOpenPost = jest.fn();
    const pinned = feedItem({ id: 'pinned-1', spaceId: 'space-1', title: 'Pinned post' });
    render(<InsideTrackView {...BASE_PROPS} pinned={[pinned]} onOpenPost={onOpenPost} />);

    fireEvent.press(screen.getByRole('button', { name: 'Pinned post' }));
    expect(onOpenPost).toHaveBeenCalledWith('space-1', 'pinned-1');
  });

  it('renders the loading state', () => {
    render(<InsideTrackView {...BASE_PROPS} isLoading pinned={undefined} latest={undefined} />);
    expect(screen.getByTestId('inside-track-loading')).toBeOnTheScreen();
  });
});
