import { cleanup, fireEvent, render, screen } from '@/core/test-utils';

import { LoginForm } from './login-form';

afterEach(cleanup);

describe('LoginForm Form ', () => {
  const LOGIN_BUTTON = 'login-button';
  it('renders correctly', async () => {
    render(<LoginForm />);
    expect(await screen.findByText(/Sign in/i)).toBeOnTheScreen();
  });

  it('should display required error when values are empty', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    fireEvent.press(button);
    expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
    expect(screen.getByText(/Password is required/i)).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'yyyy');
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.press(button);

    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
  });
});
