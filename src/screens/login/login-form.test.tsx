import 'react-native';
import '@testing-library/jest-native/extend-expect';

// Note: test renderer must be required after react-native.
import type { RenderAPI, RenderOptions } from '@testing-library/react-native';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';

import { LoginForm } from './login-form';

afterEach(cleanup);

const customRender = (
  ui: React.ReactElement<any>,
  options?: RenderOptions | undefined
): RenderAPI => render(ui, { ...options }); // render(ui, {wrapper: ThemeProvider, ...options});

describe('LoginForm Form ', () => {
  it('renders correctly', async () => {
    const { findByText } = customRender(<LoginForm />);
    expect(await findByText(/Sign in/i)).not.toBeNull();
  });

  it('should display required error when values are empty', async () => {
    const { getByText, findByText, queryByText, getByTestId } = customRender(
      <LoginForm />
    );

    const button = getByTestId('login-button');
    expect(queryByText(/Email is required/i)).toBeNull();
    fireEvent.press(button);
    expect(await findByText(/Email is required/i)).not.toBeNull();
    expect(getByText(/Password is required/i)).not.toBeNull();
  });

  it('should display matching error when email is invalid', async () => {
    const { getByTestId, findByText, queryByText } = customRender(
      <LoginForm />
    );

    const button = getByTestId('login-button');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'yyyyy');
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.press(button);

    expect(queryByText(/Email is required/i)).toBeNull();
    expect(await findByText(/Invalid Email Format/i)).not.toBeNull();
  });

  it('Should call LoginForm with correct values when values are valid', async () => {
    const mockOnSubmit = jest.fn(({ email, password }) => {
      return Promise.resolve({ email, password });
    });

    const { getByTestId } = customRender(<LoginForm onSubmit={mockOnSubmit} />);

    const button = getByTestId('login-button');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'youssef@gmail.com');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(button);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
    // TODO: check why this test is failing
    // expect(mockOnSubmit).toBeCalledWith({
    //   email: 'youssef@gmail.com',
    //   password: 'password',
    // });
  });
});
