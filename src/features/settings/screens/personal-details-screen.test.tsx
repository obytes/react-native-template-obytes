import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { PersonalDetailsScreen } from '@/features/settings/screens/personal-details-screen';

const mockPost = jest.fn();
const mockSignIn = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
  Stack: { Screen: () => null },
}));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 0 }));
jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});
jest.mock('@/lib/api/client', () => ({ client: { post: (...a: unknown[]) => mockPost(...a) } }));
jest.mock('@/features/auth/use-auth-store', () => ({
  signIn: (...a: unknown[]) => mockSignIn(...a),
  useAuthStore: {
    use: {
      token: () => 'tok',
      user: () => ({ id: 'm1', email: 'jane@example.com', name: 'Jane' }),
    },
  },
}));

describe('personalDetailsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps email read-only and saves a changed name via update-user', async () => {
    mockPost.mockResolvedValue({});
    render(<PersonalDetailsScreen />);

    expect(screen.getByTestId('personal-email').props.editable).toBe(false);
    fireEvent.changeText(screen.getByTestId('personal-name'), 'Jane Q');
    fireEvent.press(screen.getByTestId('personal-save'));

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith('/api/auth/update-user', { name: 'Jane Q' }));
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('tok', expect.objectContaining({ name: 'Jane Q' })));
    expect(await screen.findByTestId('personal-saved')).toBeOnTheScreen();
  });
});
