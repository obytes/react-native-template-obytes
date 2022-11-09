//App.spec.tsx
import { cleanup, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Login } from './index';

afterEach(cleanup);

test('LoginComponents', () => {
  render(<Login />);
  const { getByTestId } = screen;

  const emailInput = getByTestId('emailInput');
  const passwordInput = getByTestId('passwordInput');
  const LoginButton = getByTestId('LoginButton');

  expect(emailInput).toBeDefined();
  expect(passwordInput).toBeDefined();
  expect(LoginButton).toBeDefined();
});
