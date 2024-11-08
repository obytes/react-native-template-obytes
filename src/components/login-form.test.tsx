import { cleanup, fireEvent, render, screen, waitFor } from '@/core/test-utils';

import type { LoginFormProps } from './login-form';
import { LoginForm } from './login-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();

describe('LoginForm Form ', () => {
  const LOGIN_BUTTON = 'login-button';
  it('renders correctly', async () => {
    render(<LoginForm />);
    expect(await screen.findByText(/Sign in/i)).toBeOnTheScreen();
  });

  it('should display required error when values are empty', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    expect(screen.queryByText(/Username is required/i)).not.toBeOnTheScreen();
    fireEvent.press(button);
    expect(await screen.findByText(/Username is required/i)).toBeOnTheScreen();
    expect(screen.getByText(/Password is required/i)).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('email-input');
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'yyyy');
    fireEvent.changeText(usernameInput, '  ');
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.press(button);

    expect(screen.queryByText(/Username is required/i)).not.toBeOnTheScreen();
    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
  });

  it('Should call LoginForm with correct values when values are valid', async () => {
    render(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'youssef');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(button);
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    // undefined because we don't use second argument of the  SubmitHandler
    expect(onSubmitMock).toHaveBeenCalledWith(
      {
        email: undefined,
        username: 'youssef',
        password: 'password',
      },
      undefined,
    );
  });
});
