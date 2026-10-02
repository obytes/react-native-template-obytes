import { fireEvent, render, screen } from '@testing-library/react-native';

import { PollScreenView } from '@/features/polls/screens/poll-screen';

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
  useScreenBottomPadding: () => 34,
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});

const poll = {
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
};

describe('pollScreenView', () => {
  it('renders the poll card and forwards votes', () => {
    const onVote = jest.fn();
    render(<PollScreenView poll={poll} isLoading={false} onVote={onVote} pendingPollIds={[]} />);
    fireEvent.press(screen.getByTestId('poll-option-o1'));
    expect(onVote).toHaveBeenCalledWith('p1', 'o1');
  });

  it('shows an ended state when the poll is no longer available', () => {
    render(<PollScreenView poll={undefined} isLoading={false} onVote={jest.fn()} pendingPollIds={[]} />);
    expect(screen.getByText('This vote has ended')).toBeOnTheScreen();
  });

  it('shows a loading state instead of the ended message while still loading', () => {
    render(<PollScreenView poll={undefined} isLoading onVote={jest.fn()} pendingPollIds={[]} />);
    expect(screen.queryByText('This vote has ended')).not.toBeOnTheScreen();
  });
});
