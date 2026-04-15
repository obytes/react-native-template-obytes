import type { LoginFormProps } from './login-form';

import * as React from 'react';

import { act, cleanup, screen, setup, waitFor } from '@/lib/test-utils';

import { LoginForm } from './login-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();
const onSocialLoginMock: jest.Mock<LoginFormProps['onSocialLogin']> = jest.fn();
const onSSOLoginMock: jest.Mock<LoginFormProps['onSSOLogin']> = jest.fn();

// eslint-disable-next-line max-lines-per-function
describe('loginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('email-password method (default)', () => {
    it('renders correctly', async () => {
      setup(<LoginForm />);
      expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
    });

    it('should display required error when values are empty', async () => {
      const { user } = setup(<LoginForm />);

      const button = screen.getByTestId('login-button');
      expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
      await user.press(button);
      expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
      expect(screen.getByText(/Password is required/i)).toBeOnTheScreen();
    });

    it('should display matching error when email is invalid', async () => {
      const { user } = setup(<LoginForm />);

      const button = screen.getByTestId('login-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'yyyyy');
      await act(async () => {
        emailInput.props.onBlur(); // Manually trigger blur to set touched state
        await Promise.resolve(); // yield to validations
      });
      await user.type(passwordInput, 'test');

      await user.press(button);

      expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
      expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    });

    it('should call onSubmit with correct values when values are valid', async () => {
      const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

      const button = screen.getByTestId('login-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'youssef@gmail.com');
      await user.type(passwordInput, 'password');
      await user.press(button);
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
      });
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'youssef@gmail.com',
          password: 'password',
        }),
      );
    });

    it('should render custom title and subtitle', async () => {
      setup(<LoginForm title="Custom Title" subtitle="Custom subtitle" />);
      expect(await screen.findByText('Custom Title')).toBeOnTheScreen();
      expect(screen.getByText('Custom subtitle')).toBeOnTheScreen();
    });
  });

  describe('social method', () => {
    it('should render social login buttons', async () => {
      setup(
        <LoginForm
          authConfig={{ method: 'social', providers: ['google', 'apple'] }}
          onSocialLogin={onSocialLoginMock}
        />,
      );

      expect(await screen.findByTestId('social-google-button')).toBeOnTheScreen();
      expect(screen.getByTestId('social-apple-button')).toBeOnTheScreen();
      // Should not render email/password fields for social-only
      expect(screen.queryByTestId('email-input')).not.toBeOnTheScreen();
    });

    it('should call onSocialLogin when social button is pressed', async () => {
      const { user } = setup(
        <LoginForm
          authConfig={{ method: 'social', providers: ['google'] }}
          onSocialLogin={onSocialLoginMock}
        />,
      );

      const googleButton = await screen.findByTestId('social-google-button');
      await user.press(googleButton);

      expect(onSocialLoginMock).toHaveBeenCalledWith('google');
    });
  });

  describe('sso method', () => {
    it('should render SSO button', async () => {
      setup(
        <LoginForm
          authConfig={{
            method: 'sso',
            provider: 'Okta',
            issuer: 'https://okta.example.com',
            clientId: 'xxx',
          }}
          onSSOLogin={onSSOLoginMock}
        />,
      );

      expect(await screen.findByTestId('sso-button')).toBeOnTheScreen();
      // Should not render email/password fields for SSO-only
      expect(screen.queryByTestId('email-input')).not.toBeOnTheScreen();
    });

    it('should call onSSOLogin when SSO button is pressed', async () => {
      const { user } = setup(
        <LoginForm
          authConfig={{
            method: 'sso',
            provider: 'Okta',
            issuer: 'https://okta.example.com',
            clientId: 'xxx',
          }}
          onSSOLogin={onSSOLoginMock}
        />,
      );

      const ssoButton = await screen.findByTestId('sso-button');
      await user.press(ssoButton);

      expect(onSSOLoginMock).toHaveBeenCalled();
    });
  });

  describe('composite method', () => {
    it('should render email-password with social alternatives', async () => {
      setup(
        <LoginForm
          authConfig={{
            method: 'composite',
            primary: { method: 'email-password' },
            alternatives: [{ method: 'social', providers: ['google', 'github'] }],
          }}
          onSubmit={onSubmitMock}
          onSocialLogin={onSocialLoginMock}
        />,
      );

      // Should render email/password fields
      expect(await screen.findByTestId('email-input')).toBeOnTheScreen();
      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
      expect(screen.getByTestId('login-button')).toBeOnTheScreen();

      // Should render social buttons as alternatives
      expect(screen.getByTestId('social-google-button')).toBeOnTheScreen();
      expect(screen.getByTestId('social-github-button')).toBeOnTheScreen();
    });

    it('should render social primary with email-password alternative', async () => {
      setup(
        <LoginForm
          authConfig={{
            method: 'composite',
            primary: { method: 'social', providers: ['apple'] },
            alternatives: [{ method: 'email-password' }],
          }}
          onSubmit={onSubmitMock}
          onSocialLogin={onSocialLoginMock}
        />,
      );

      // Should render both social and email/password
      expect(await screen.findByTestId('social-apple-button')).toBeOnTheScreen();
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
    });
  });
});
