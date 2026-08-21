import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { LoginScreen } from '../login-screen';

jest.mock('@clerk/expo', () => ({
  useSignIn: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

type NavigateArgs = { decorateUrl: (url: string) => string };

const password = jest.fn();
const finalize = jest.fn();
const replace = jest.fn();

const signIn = {
  password,
  finalize,
  status: 'needs_first_factor' as string,
};

const mockedUseSignIn = useSignIn as unknown as jest.Mock;
const mockedUseRouter = useRouter as unknown as jest.Mock;
const mockedShowMessage = showMessage as unknown as jest.Mock;

const VALID_EMAIL = 'youssef@gmail.com';
const VALID_PASSWORD = 'password';

async function submitCredentials(
  user: ReturnType<typeof setup>['user'],
  email = VALID_EMAIL,
  pwd = VALID_PASSWORD,
) {
  await user.type(screen.getByTestId('email-input'), email);
  await user.type(screen.getByTestId('password-input'), pwd);
  await user.press(screen.getByTestId('login-button'));
}

beforeEach(() => {
  jest.clearAllMocks();
  signIn.status = 'needs_first_factor';
  password.mockResolvedValue({ error: null });
  finalize.mockImplementation(async ({ navigate }: { navigate: (args: NavigateArgs) => void }) => {
    // Clerk hands the callback a decorateUrl that appends the handshake params.
    navigate({ decorateUrl: (url: string) => `${url}?__clerk_db_jwt=jwt` });
  });
  mockedUseSignIn.mockReturnValue({ signIn });
  mockedUseRouter.mockReturnValue({ replace, push: jest.fn(), back: jest.fn() });
});

afterEach(cleanup);

describe('loginScreen', () => {
  it('renders the login form', async () => {
    setup(<LoginScreen />);
    expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
  });

  it('signs in with the credentials the user typed', async () => {
    signIn.status = 'complete';
    const { user } = setup(<LoginScreen />);

    await submitCredentials(user);

    await waitFor(() => {
      expect(password).toHaveBeenCalledTimes(1);
    });
    expect(password).toHaveBeenCalledWith({
      emailAddress: VALID_EMAIL,
      password: VALID_PASSWORD,
    });
  });

  it('does not attempt to sign in while the form is invalid', async () => {
    const { user } = setup(<LoginScreen />);

    await user.press(screen.getByTestId('login-button'));

    expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
    expect(password).not.toHaveBeenCalled();

    // A password shorter than the 6-character minimum is still rejected locally.
    await user.type(screen.getByTestId('email-input'), VALID_EMAIL);
    await user.type(screen.getByTestId('password-input'), 'short');
    await user.press(screen.getByTestId('login-button'));

    expect(
      await screen.findByText(/Password must be at least 6 characters/i),
    ).toBeOnTheScreen();
    expect(password).not.toHaveBeenCalled();
  });

  it('shows an error and stays on the screen when sign-in is rejected', async () => {
    password.mockResolvedValue({ error: { code: 'form_password_incorrect' } });
    signIn.status = 'complete';
    const { user } = setup(<LoginScreen />);

    await submitCredentials(user);

    await waitFor(() => {
      expect(mockedShowMessage).toHaveBeenCalledTimes(1);
    });
    expect(mockedShowMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'danger',
        message: 'Sign in failed. Check your email and password.',
      }),
    );
    expect(finalize).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('finalizes the session and navigates home on a complete sign-in', async () => {
    signIn.status = 'complete';
    const { user } = setup(<LoginScreen />);

    await submitCredentials(user);

    await waitFor(() => {
      expect(finalize).toHaveBeenCalledTimes(1);
    });
    expect(replace).toHaveBeenCalledWith('/?__clerk_db_jwt=jwt');
    expect(mockedShowMessage).not.toHaveBeenCalled();
  });

  it('does not navigate when sign-in needs another step', async () => {
    signIn.status = 'needs_second_factor';
    const { user } = setup(<LoginScreen />);

    await submitCredentials(user);

    await waitFor(() => {
      expect(password).toHaveBeenCalledTimes(1);
    });
    expect(finalize).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
