import { cleanup, screen, setup, waitFor } from '@/core/test-utils';

import type { LoginFormProps } from './login-form';
import { LoginForm } from './login-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();

describe('LoginForm Form ', () => {
  const LOGIN_BUTTON = 'login-button';
  it('renders correctly', async () => {
    setup(<LoginForm />);
    expect(await screen.findByText(/Sign in/i)).toBeOnTheScreen();
  });

  it('should display required error when values are empty', async () => {
    const { user } = setup(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    await user.press(button);
    expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
    expect(screen.getByText(/Password is required/i)).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    const { user } = setup(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'yyyyy');
    await user.type(passwordInput, 'test');
    await user.press(button);

    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
  });

  it('Should call LoginForm with correct values when values are valid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'youssef@gmail.com');
    await user.type(passwordInput, 'password');
    await user.press(button);
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    // expect.objectContaining({}) because we don't want to test the target event we are receiving from the onSubmit function
    expect(onSubmitMock).toHaveBeenCalledWith(
      {
        email: 'youssef@gmail.com',
        password: 'password',
      },
      expect.objectContaining({}),
    );
  });
});
