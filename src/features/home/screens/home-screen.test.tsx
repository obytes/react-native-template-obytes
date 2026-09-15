import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { HomeScreen } from '@/features/home/screens/home-screen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null, Image: 'Image' };
});

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
}));

jest.mock('@/components/ui/tab-bar-layout', () => ({
  useTabBarContentPadding: () => 120,
}));

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: {
    use: {
      user: () => ({ id: 'member-1', email: 'jane@example.com', name: 'Jane Member' }),
    },
  },
}));

const mockEmptyQuery = {
  data: undefined,
  isLoading: false,
  isRefetching: false,
  refetch: jest.fn(),
};

jest.mock('@/features/pulse/api/use-next-run', () => ({
  useNextRun: () => mockEmptyQuery,
}));
jest.mock('@/features/pulse/api/use-latest-results', () => ({
  useLatestResults: () => mockEmptyQuery,
}));
jest.mock('@/features/pulse/api/use-latest-news', () => ({
  useLatestNews: () => mockEmptyQuery,
}));
jest.mock('@/features/pulse/api/use-trainer-updates', () => ({
  useTrainerUpdates: () => mockEmptyQuery,
}));
jest.mock('@/features/stables/api/use-followed-horses', () => ({
  useFollowedHorses: () => mockEmptyQuery,
}));
jest.mock('@/features/member-content/api/use-inside-track', () => ({
  useInsideTrack: () => mockEmptyQuery,
}));
jest.mock('@/features/events/api/use-events', () => ({
  useEvents: () => mockEmptyQuery,
}));
jest.mock('@/features/polls/api/use-active-polls', () => ({
  useActivePolls: () => mockEmptyQuery,
}));
jest.mock('@/features/paddock/api/use-charity', () => ({
  useCharity: () => mockEmptyQuery,
}));
jest.mock('@/features/paddock/api/use-offers', () => ({
  useOffers: () => mockEmptyQuery,
}));
jest.mock('@/features/polls/api/use-poll-vote', () => ({
  usePollVote: () => ({ vote: jest.fn(), pendingPollIds: [] }),
}));
jest.mock('@/features/home/components/notifications-bell', () => ({
  NotificationsBell: () => null,
}));

describe('homeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the headline card (welcome fallback with no data)', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('headline-card')).toBeOnTheScreen();
    expect(screen.getByText('Welcome to the club')).toBeOnTheScreen();
  });

  it('renders the My Horses tile with its empty-state nudge', () => {
    render(<HomeScreen />);
    expect(screen.getByText('My Horses')).toBeOnTheScreen();
    expect(screen.getByText('Follow horses in the Stables to see them here.')).toBeOnTheScreen();
  });

  it('opens the profile from the avatar', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId('home-avatar'));
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });
});
