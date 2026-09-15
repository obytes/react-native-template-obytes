import { fireEvent, render, screen } from '@testing-library/react-native';

import { formatBadge, NotificationsBell } from '@/features/home/components/notifications-bell';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseInboxBadge = jest.fn();

jest.mock('@/features/notification-centre/api/use-inbox-badge', () => ({
  useInboxBadge: (...args: unknown[]) => mockUseInboxBadge(...args),
}));

const scope = { organizationId: 'org-1', memberId: 'member-1' };

describe('formatBadge', () => {
  it('returns null for 0', () => {
    expect(formatBadge(0)).toBeNull();
  });

  it('returns the count as a string', () => {
    expect(formatBadge(7)).toBe('7');
  });

  it('caps at 99+', () => {
    expect(formatBadge(250)).toBe('99+');
  });
});

describe('notificationsBell', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without a badge when the count is 0', () => {
    mockUseInboxBadge.mockReturnValue({ data: 0 });
    render(<NotificationsBell scope={scope} />);
    expect(screen.queryByTestId('home-bell-badge')).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Notifications')).toBeOnTheScreen();
  });

  it('renders the badge count and accessibility label', () => {
    mockUseInboxBadge.mockReturnValue({ data: 3 });
    render(<NotificationsBell scope={scope} />);
    expect(screen.getByTestId('home-bell-badge')).toHaveTextContent('3');
    expect(screen.getByLabelText('Notifications, 3 new')).toBeOnTheScreen();
  });

  it('navigates to /notifications on press', () => {
    mockUseInboxBadge.mockReturnValue({ data: 0 });
    render(<NotificationsBell scope={scope} />);
    fireEvent.press(screen.getByTestId('home-bell'));
    expect(mockPush).toHaveBeenCalledWith('/notifications');
  });
});
