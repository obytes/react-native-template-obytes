import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { HomeScreen } from '@/features/home/screens/home-screen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react');
    useEffect(cb, [cb]);
  },
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

let mockUser: { id: string; email: string; name?: string } = { id: 'member-1', email: 'jane@example.com', name: 'Jane Member' };
jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: { use: { user: () => mockUser } },
}));

function mockQuery(data: unknown) {
  return { data, isLoading: false, isRefetching: false, refetch: jest.fn() };
}

const mockData: Record<string, unknown> = {};
function reset() {
  for (const key of Object.keys(mockData)) delete mockData[key];
}

jest.mock('@/features/pulse/api/use-next-run', () => ({ useNextRun: () => mockQuery(mockData.nextRun) }));
jest.mock('@/features/pulse/api/use-latest-results', () => ({ useLatestResults: () => mockQuery(mockData.results) }));
jest.mock('@/features/pulse/api/use-latest-news', () => ({ useLatestNews: () => mockQuery(mockData.news) }));
jest.mock('@/features/stables/api/use-followed-horses', () => ({ useFollowedHorses: () => mockQuery(mockData.followed) }));
jest.mock('@/features/member-content/api/use-inside-track', () => ({ useInsideTrack: () => mockQuery(mockData.insideTrack) }));
jest.mock('@/features/events/api/use-events', () => ({ useEvents: () => mockQuery(mockData.events) }));
jest.mock('@/features/paddock/api/use-charity', () => ({ useCharity: () => mockQuery(mockData.charity) }));
jest.mock('@/features/notification-centre/api/use-inbox-badge', () => ({ useInboxBadge: () => mockQuery(mockData.badge) }));

const news = [{
  id: 'n1',
  slug: 'ashfield',
  title: 'Ashfield Rose declares for Leopardstown',
  subtitle: 'Ger says she has never worked better.',
  featuredImageUrl: null,
  publishedAt: new Date().toISOString(),
  author: null,
}];

describe('homeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reset();
    mockUser = { id: 'member-1', email: 'jane@example.com', name: 'Jane Member' };
  });

  it('greets by first name and shows the bell and avatar', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('home-greeting')).toHaveTextContent(/^Good (morning|afternoon|evening), Jane$/);
    expect(screen.getByTestId('home-bell')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('home-avatar'));
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('greets without a name', () => {
    mockUser = { id: 'member-1', email: 'jane@example.com' };
    render(<HomeScreen />);
    expect(screen.getByTestId('home-greeting')).toHaveTextContent(/^Good (morning|afternoon|evening)$/);
  });

  it('stays composed with no data: chips, empty My horses, no hero/charity/events', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('home-chips-unread')).toBeOnTheScreen();
    expect(screen.getByTestId('home-chips-events')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-chips-raceDay')).not.toBeOnTheScreen();
    expect(screen.queryByText('Mentions')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('home-hero')).not.toBeOnTheScreen();
    expect(screen.getByText('Follow a horse to see it here')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-charity')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('home-event')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('home-inside-track')).not.toBeOnTheScreen();
  });

  it('routes chips to their targets', () => {
    mockData.badge = 3;
    render(<HomeScreen />);
    expect(screen.getByTestId('home-chips-unread-count')).toHaveTextContent('3');
    fireEvent.press(screen.getByTestId('home-chips-unread'));
    expect(mockPush).toHaveBeenCalledWith('/notifications');
    fireEvent.press(screen.getByTestId('home-chips-events'));
    expect(mockPush).toHaveBeenCalledWith('/events');
  });

  it('renders the news hero and opens the article', () => {
    mockData.news = news;
    render(<HomeScreen />);
    expect(screen.getByText('Ashfield Rose declares for Leopardstown')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('home-hero-cta-0'));
    expect(mockPush).toHaveBeenCalledWith('/news/ashfield');
  });

  it('renders followed horses, charity and the next event', () => {
    mockData.followed = [{ id: 'h1', name: 'Ashfield Rose', photos: [] }];
    mockData.charity = { ok: true, charity: { charityName: 'Womens Health', totalCents: 2_450_000 } };
    mockData.events = {
      ok: true,
      configured: true,
      events: [{ id: 'e1', title: 'Race day: Leopardstown', startsAt: null, rsvp: { count: 8, limit: 20 } }],
    };
    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('home-horse-h1'));
    expect(mockPush).toHaveBeenCalledWith('/stables/h1');

    expect(screen.getByText('€24,500')).toBeOnTheScreen();
    expect(screen.getByText('raised for Womens Health')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('home-charity-open'));
    expect(mockPush).toHaveBeenCalledWith('/paddock/charity');

    expect(screen.getByText('12/20 slots remaining')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('home-event'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/event/[event-id]', params: { 'event-id': 'e1' } });
  });

  it('opens the Inside Track item and tags fresh pieces NEW', () => {
    mockData.insideTrack = {
      ok: true,
      configured: true,
      pinned: [],
      latest: [{ id: 'p1', spaceId: 's1', title: 'How a filly is named', createdAt: new Date().toISOString(), imageUrl: null }],
    };
    render(<HomeScreen />);
    expect(screen.getByTestId('home-inside-track-new')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('home-inside-track'));
    expect(mockPush).toHaveBeenCalledWith('/post/s1/p1');
  });
});
