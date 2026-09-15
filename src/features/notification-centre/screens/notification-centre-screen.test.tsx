import type { InboxItem } from '@/features/notification-centre/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { NotificationCentreScreen } from '@/features/notification-centre/screens/notification-centre-screen';

const mockMarkRead = { mutate: jest.fn() };
const mockMarkAllRead = { mutate: jest.fn() };
const mockMarkSeen = { mutate: jest.fn() };
const mockRouteToTarget = jest.fn();

let mockInbox: {
  data: { pages: { items: InboxItem[] }[] } | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: jest.Mock;
  refetch: jest.Mock;
};

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => cb(),
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => React.ReactNode } }) => options?.headerRight?.() ?? null },
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null, Image: 'Image' };
});

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: {
    use: {
      user: () => ({ id: 'member-1', email: 'jane@example.com', name: 'Jane Member' }),
    },
  },
}));

jest.mock('@/features/notification-centre/api/use-inbox', () => ({
  useInbox: () => mockInbox,
}));
jest.mock('@/features/notification-centre/api/use-inbox-actions', () => ({
  useMarkRead: () => mockMarkRead,
  useMarkAllRead: () => mockMarkAllRead,
  useMarkSeen: () => mockMarkSeen,
}));
jest.mock('@/features/notifications/deep-link', () => ({
  routeToTarget: (data: unknown) => mockRouteToTarget(data),
  isPushData: (data: unknown) => {
    const d = data as { screen?: unknown };
    return !!d && typeof d === 'object' && typeof d.screen === 'string' && d.screen !== 'bogus';
  },
}));

function itemAt(id: string, isoOffset: number, unread: boolean): InboxItem {
  const date = new Date();
  date.setDate(date.getDate() - isoOffset);
  return {
    id,
    kind: 'news',
    icon: 'club',
    title: `Title ${id}`,
    body: 'Body text',
    imageUrl: null,
    actorAvatarUrl: null,
    data: { screen: 'insideTrack' },
    unread,
    updatedAt: date.toISOString(),
  };
}

function baseInbox(overrides: Partial<typeof mockInbox> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('notificationCentreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInbox = baseInbox();
  });

  it('shows the loading state', () => {
    mockInbox = baseInbox({ isLoading: true, data: undefined });
    render(<NotificationCentreScreen />);
    expect(screen.getByTestId('inbox-loading')).toBeOnTheScreen();
  });

  it('shows the unavailable state on error without data', () => {
    mockInbox = baseInbox({ isError: true, data: undefined });
    render(<NotificationCentreScreen />);
    expect(screen.getByTestId('inbox-unavailable')).toBeOnTheScreen();
  });

  it('shows the empty state', () => {
    mockInbox = baseInbox({ data: { pages: [{ items: [] }] } });
    render(<NotificationCentreScreen />);
    expect(screen.getByTestId('inbox-empty')).toBeOnTheScreen();
    expect(screen.getByText('You\'re all caught up')).toBeOnTheScreen();
  });

  it('renders section headers and rows for items across two days', () => {
    const items = [itemAt('today-1', 0, true), itemAt('old-1', 10, false)];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    expect(screen.getByText('Today')).toBeOnTheScreen();
    expect(screen.getByText('Earlier')).toBeOnTheScreen();
    expect(screen.getByTestId('inbox-row-today-1')).toBeOnTheScreen();
    expect(screen.getByTestId('inbox-row-old-1')).toBeOnTheScreen();
  });

  it('calls markSeen once on focus', () => {
    mockInbox = baseInbox({ data: { pages: [{ items: [] }] } });
    render(<NotificationCentreScreen />);
    expect(mockMarkSeen.mutate).toHaveBeenCalledTimes(1);
  });

  it('pressing an unread row marks it read then routes to the target', () => {
    const items = [itemAt('today-1', 0, true)];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    fireEvent.press(screen.getByTestId('inbox-row-today-1'));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith('today-1');
    expect(mockRouteToTarget).toHaveBeenCalledWith({ screen: 'insideTrack' });
  });

  it('pressing a read row only routes to the target', () => {
    const items = [itemAt('today-1', 0, false)];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    fireEvent.press(screen.getByTestId('inbox-row-today-1'));
    expect(mockMarkRead.mutate).not.toHaveBeenCalled();
    expect(mockRouteToTarget).toHaveBeenCalledWith({ screen: 'insideTrack' });
  });

  it('pressing a row with malformed data marks it read but does not route', () => {
    const items = [
      { ...itemAt('today-1', 0, true), data: { screen: 'bogus' } },
    ] as unknown as InboxItem[];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    fireEvent.press(screen.getByTestId('inbox-row-today-1'));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith('today-1');
    expect(mockRouteToTarget).not.toHaveBeenCalled();
  });

  it('shows the mark-all-as-read action only when something is unread and calls markAllRead on press', () => {
    const items = [itemAt('today-1', 0, true)];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    fireEvent.press(screen.getByTestId('inbox-mark-all'));
    expect(mockMarkAllRead.mutate).toHaveBeenCalledTimes(1);
  });

  it('does not show the mark-all-as-read action when nothing is unread', () => {
    const items = [itemAt('today-1', 0, false)];
    mockInbox = baseInbox({ data: { pages: [{ items }] } });
    render(<NotificationCentreScreen />);
    expect(screen.queryByTestId('inbox-mark-all')).not.toBeOnTheScreen();
  });
});
