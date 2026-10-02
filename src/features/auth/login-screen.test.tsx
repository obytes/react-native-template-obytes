import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { LoginScreen } from './login-screen';

const mockReplace = jest.fn();
const mockSignIn = jest.fn();
const mockBootstrap = jest.fn();
const mockSetToken = jest.fn();
const mockSetUser = jest.fn();
const mockRemoveToken = jest.fn();
const mockRemoveUser = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});

jest.mock('@/features/arrival/welcome-loader', () => {
  const React = require('react');
  return {
    WelcomeLoader: ({ onReady }: { name?: string; onReady: () => void }) => {
      React.useEffect(() => onReady(), [onReady]);
      return null;
    },
  };
});

jest.mock('@/lib/auth/mobile-org-bootstrap', () => ({
  bootstrapMobileOrganization: (...args: unknown[]) => mockBootstrap(...args),
}));

jest.mock('@/lib/auth/utils', () => ({
  setToken: (...args: unknown[]) => mockSetToken(...args),
  setUser: (...args: unknown[]) => mockSetUser(...args),
  removeToken: () => mockRemoveToken(),
  removeUser: () => mockRemoveUser(),
}));

jest.mock('./use-auth-store', () => ({
  useAuthStore: {
    use: {
      signIn: () => mockSignIn,
    },
  },
}));

jest.mock('./components/login-form', () => {
  const { Pressable, Text } = require('react-native');
  return {
    LoginForm: ({ onSuccess }: { onSuccess: (data: { token: string; user: { id: string; email: string } }) => Promise<void> | void }) => (
      <Pressable
        testID="login-success"
        onPress={() => {
          void Promise.resolve(
            onSuccess({ token: 'tok', user: { id: 'u1', email: 'a@b.c' } }),
          ).catch(() => {});
        }}
      >
        <Text>go</Text>
      </Pressable>
    ),
  };
});

describe('loginScreen', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSignIn.mockReset();
    mockBootstrap.mockReset();
    mockSetToken.mockReset();
    mockSetUser.mockReset();
    mockRemoveToken.mockReset();
    mockRemoveUser.mockReset();
  });

  it('does not flip signIn until membership bootstrap succeeds', async () => {
    let resolveBootstrap!: (value?: unknown) => void;
    mockBootstrap.mockReturnValue(new Promise((resolve) => {
      resolveBootstrap = resolve;
    }));

    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-success'));

    await waitFor(() => expect(mockSetToken).toHaveBeenCalledWith('tok'));
    expect(mockBootstrap).toHaveBeenCalledWith({ verifyMembership: true });
    expect(mockSignIn).not.toHaveBeenCalled();

    resolveBootstrap();
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('tok', { id: 'u1', email: 'a@b.c' }));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('clears the staged token and does not sign in when bootstrap fails', async () => {
    mockBootstrap.mockRejectedValue(new Error('Request failed with status code 401'));

    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-success'));

    await waitFor(() => expect(mockRemoveToken).toHaveBeenCalled());
    expect(mockRemoveUser).toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
