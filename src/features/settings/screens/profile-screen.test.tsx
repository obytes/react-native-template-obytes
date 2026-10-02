import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { ProfileScreen } from '@/features/settings/screens/profile-screen';

const mockPush = jest.fn();
const mockSignOut = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  Stack: { Screen: () => null },
}));

jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 0 }));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});

jest.mock('@/features/auth/use-auth-store', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
  useAuthStore: {
    use: {
      user: () => ({ id: 'member-1', email: 'jane@example.com', name: 'Jane Member' }),
    },
  },
}));

describe('profileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the member identity (email as subline until S13-12) and log out', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Jane Member')).toBeOnTheScreen();
    expect(screen.getByText('jane@example.com')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('sign-out-button'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('carries zero billing surfaces (D9)', () => {
    render(<ProfileScreen />);

    expect(screen.queryByText(/renew/i)).toBeNull();
    expect(screen.queryByText(/billing/i)).toBeNull();
    expect(screen.queryByText(/subscription/i)).toBeNull();
    expect(screen.queryByText(/payment/i)).toBeNull();
    expect(screen.getByText('Active')).toBeOnTheScreen();
  });

  it('has no Notifications row (the Home bell owns it)', () => {
    render(<ProfileScreen />);

    expect(screen.queryByText(/^notifications$/i)).toBeNull();
    expect(screen.getByText('Notification preferences')).toBeOnTheScreen();
  });

  it('routes the settings rows', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByTestId('row-personal-details'));
    expect(mockPush).toHaveBeenLastCalledWith('/settings/personal-details');
    fireEvent.press(screen.getByTestId('profile-edit'));
    expect(mockPush).toHaveBeenLastCalledWith('/settings/personal-details');
    fireEvent.press(screen.getByTestId('row-notification-preferences'));
    expect(mockPush).toHaveBeenLastCalledWith('/settings/notifications');
    fireEvent.press(screen.getByTestId('row-followed-horses'));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/stables', params: { filter: 'following' } });
    fireEvent.press(screen.getByTestId('row-change-password'));
    expect(mockPush).toHaveBeenLastCalledWith('/settings/change-password');
    fireEvent.press(screen.getByTestId('row-delete-account'));
    expect(mockPush).toHaveBeenLastCalledWith('/settings/delete-account');
  });
});
