import type { Charity } from '@/features/paddock/types';
import type { Poll } from '@/features/polls/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { CharityView } from '@/features/paddock/screens/charity-screen';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null, Image: 'Image' };
});
jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 70 }));
jest.mock('@/components/ui/tab-bar-layout', () => ({ useTabBarContentPadding: () => 120 }));

const CHARITY: Charity = {
  charityName: 'Irish Injured Jockeys',
  description: 'Supporting jockeys after injury.',
  logoUrl: null,
  websiteUrl: 'https://iij.ie',
  percentage: 5,
  totalCents: 2_450_000,
  goalCents: 3_600_000,
  goalProgress: 2_450_000 / 3_600_000,
  currency: 'EUR',
  stories: [{ id: 'n1', slug: 'six-horses', title: 'Six horses retrained', subtitle: null, featuredImageUrl: null, publishedAt: '2026-08-01T00:00:00.000Z' }],
  pollId: 'p1',
};

const POLL: Poll = {
  id: 'p1',
  question: 'Which cause next season?',
  scope: 'club',
  circleSpaceId: null,
  status: 'open',
  publishedAt: '2026-08-20T00:00:00.000Z',
  closesAt: null,
  options: [{ id: 'a', label: 'Equine welfare', sortOrder: 0 }, { id: 'b', label: 'Local hospice', sortOrder: 1 }],
  myVoteOptionId: null,
  results: null,
};

const base = {
  isLoading: false,
  isError: false,
  isRefetching: false,
  onRefresh: jest.fn(),
  onOpenStory: jest.fn(),
  onOpenWebsite: jest.fn(),
  onVote: jest.fn(),
  pendingPollIds: [],
};

describe('charityView', () => {
  it('renders total, goal line and the single active charity', () => {
    render(<CharityView {...base} charity={CHARITY} poll={POLL} />);
    expect(screen.getByText('\u20AC24,500')).toBeOnTheScreen();
    expect(screen.getByText('68% of this year\u2019s \u20AC36,000 goal')).toBeOnTheScreen();
    expect(screen.getByText('Irish Injured Jockeys')).toBeOnTheScreen();
  });

  it('opens the charity url, and lists charities[] when present', () => {
    const { rerender } = render(<CharityView {...base} charity={CHARITY} poll={POLL} />);
    fireEvent.press(screen.getByTestId('charity-row-0'));
    expect(base.onOpenWebsite).toHaveBeenCalledWith('https://iij.ie');
    rerender(<CharityView {...base} poll={POLL} charity={{ ...CHARITY, charities: [{ name: 'A', url: null }, { name: 'B', url: 'https://b.ie' }] }} />);
    expect(screen.getByText('A')).toBeOnTheScreen();
    expect(screen.getByText('B')).toBeOnTheScreen();
    expect(screen.queryByTestId('charity-row-0-chevron')).toBeNull();
    expect(screen.getByTestId('charity-row-1-chevron')).toBeOnTheScreen();
  });

  it('opens the latest story and shows read time only when measurable', () => {
    const { rerender } = render(<CharityView {...base} charity={CHARITY} poll={POLL} />);
    fireEvent.press(screen.getByTestId('charity-story-n1'));
    expect(base.onOpenStory).toHaveBeenCalledWith('six-horses');
    expect(screen.queryByTestId('story-read-time')).toBeNull();
    rerender(<CharityView {...base} poll={POLL} charity={{ ...CHARITY, stories: [{ ...CHARITY.stories[0], wordCount: 500 }] }} />);
    expect(screen.getByText('3 min read')).toBeOnTheScreen();
  });

  it('renders the inline vote and forwards votes', () => {
    render(<CharityView {...base} charity={CHARITY} poll={POLL} />);
    fireEvent.press(screen.getByTestId('poll-option-a'));
    expect(base.onVote).toHaveBeenCalledWith('p1', 'a');
  });

  it('shows results bars after voting', () => {
    render(<CharityView {...base} charity={CHARITY} poll={{ ...POLL, myVoteOptionId: 'a', results: { total: 4, byOption: { a: 3, b: 1 } } }} />);
    expect(screen.getByTestId('poll-bar-a')).toBeOnTheScreen();
    expect(screen.getByText('4 votes')).toBeOnTheScreen();
  });

  it('omits goal, stories and vote when absent', () => {
    render(<CharityView {...base} charity={{ ...CHARITY, goalCents: null, goalProgress: null, pollId: null, stories: [] }} poll={undefined} />);
    expect(screen.queryByText(/goal/)).toBeNull();
    expect(screen.queryByTestId('charity-story-n1')).toBeNull();
    expect(screen.queryByText('Member vote')).toBeNull();
  });

  it('shows the not-yet state when no charity is configured', () => {
    render(<CharityView {...base} charity={null} poll={undefined} />);
    expect(screen.getByTestId('charity-empty')).toBeOnTheScreen();
  });

  it('shows the unavailable state on error', () => {
    render(<CharityView {...base} charity={undefined} poll={undefined} isError />);
    expect(screen.getByTestId('charity-unavailable')).toBeOnTheScreen();
  });

  it('disables the poll options while the vote is pending', () => {
    render(<CharityView {...base} charity={CHARITY} poll={POLL} pendingPollIds={['p1']} />);
    expect(screen.getByTestId('poll-option-a')).toHaveProp('accessibilityState', expect.objectContaining({ disabled: true }));
  });
});
