import { cleanup, fireEvent, render, screen, waitFor } from '@/core/test-utils';

import {
  ForgotPasswordForm,
  type ForgotPasswordFormProps,
} from './forgot-password-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<ForgotPasswordFormProps['onSubmit']> = jest.fn();

describe('ForgotPasswordForm', () => {
  const SEND_EMAIL_BUTTON = 'send-email-button';
  const EMAIL_INPUT = 'email-input';

  it('renders correctly', async () => {
    render(<ForgotPasswordForm onSubmit={onSubmitMock} />);
    expect(await screen.findByText(/Forgot your password?/i)).toBeOnTheScreen();
  });

  it('should display error when email is empty', async () => {
    render(<ForgotPasswordForm onSubmit={onSubmitMock} />);
    const button = screen.getByTestId(SEND_EMAIL_BUTTON);
    fireEvent.press(button);
    expect(await screen.findByText(/Required/i)).toBeOnTheScreen();
  });

  it('should display error when email is invalid', async () => {
    render(<ForgotPasswordForm onSubmit={onSubmitMock} />);
    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const button = screen.getByTestId(SEND_EMAIL_BUTTON);

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(button);

    expect(await screen.findByText(/Invalid email format/i)).toBeOnTheScreen();
  });

  it('should call onSubmit with correct values when email is valid', async () => {
    render(<ForgotPasswordForm onSubmit={onSubmitMock} />);
    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const button = screen.getByTestId(SEND_EMAIL_BUTTON);

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(button);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitMock).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });
});
