import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { TermsGate } from './terms-gate';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockSignOut = jest.fn();
let mockStatus = 'signIn';

jest.mock('@/lib/api/client', () => ({
  client: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

jest.mock('@/lib/open-external-link', () => ({ openExternalLink: jest.fn() }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/features/auth/use-auth-store', () => ({
  signOut: () => mockSignOut(),
  useAuthStore: {
    use: {

      status: () => mockStatus,
      user: () => ({ id: 'u1', email: 'a@b.c' }),
    },
  },
}));

function status(needsAcceptance: boolean) {
  return {
    data: {
      currentVersion: '2026-09-27',
      acceptedVersion: needsAcceptance ? null : '2026-09-27',
      ageConfirmed: !needsAcceptance,
      needsAcceptance,
    },
  };
}

let queryClient: QueryClient;

function renderGate() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TermsGate />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStatus = 'signIn';
  mockPost.mockResolvedValue({ data: {} });
});

afterEach(() => queryClient?.clear());

describe('termsGate', () => {
  it('renders nothing when the member has already accepted', async () => {
    mockGet.mockResolvedValue(status(false));
    renderGate();

    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/api/legal/status'));
    expect(screen.queryByTestId('accept-terms-button')).toBeNull();
  });

  it('does not query status when signed out', () => {
    mockStatus = 'signOut';
    renderGate();

    expect(mockGet).not.toHaveBeenCalled();
    expect(screen.queryByTestId('accept-terms-button')).toBeNull();
  });

  it('requires both checkboxes before accepting, then posts the 18+ confirmation and terms', async () => {
    mockGet.mockResolvedValueOnce(status(true)).mockResolvedValue(status(false));
    renderGate();

    const button = await screen.findByTestId('accept-terms-button');
    fireEvent.press(button);
    expect(mockPost).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('over18-checkbox'));
    fireEvent.press(button);
    expect(mockPost).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('terms-checkbox'));
    fireEvent.press(screen.getByTestId('accept-terms-button'));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith('/api/legal/accept', {
        version: '2026-09-27',
        over18: true,
        source: 'mobile_prompt',
      }),
    );
    await waitFor(() => expect(screen.queryByTestId('accept-terms-button')).toBeNull());
  });

  it('shows an error and stays up when accepting fails', async () => {
    mockGet.mockResolvedValue(status(true));
    mockPost.mockRejectedValue(new Error('boom'));
    renderGate();

    fireEvent.press(await screen.findByTestId('over18-checkbox'));
    fireEvent.press(screen.getByTestId('terms-checkbox'));
    fireEvent.press(screen.getByTestId('accept-terms-button'));

    expect(await screen.findByText(/couldn't save your acceptance/)).toBeTruthy();
    expect(screen.getByTestId('accept-terms-button')).toBeTruthy();
  });

  it('lets the member sign out instead', async () => {
    mockGet.mockResolvedValue(status(true));
    renderGate();

    fireEvent.press(await screen.findByTestId('accept-terms-sign-out'));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
