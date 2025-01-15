/* eslint-disable max-lines-per-function */
import { act, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { render } from '@/core/test-utils';

import { AuthProvider, authStorage, HEADER_KEYS, useAuth } from './auth';

jest.mock('@/api', () => {
  const originalModule = jest.requireActual('@/api'); // Import the original module
  const mockStore: Record<string, string> = {};

  return {
    ...originalModule, // Spread the original module to keep other exports
    authStorage: {
      getString: jest.fn((key: string) => mockStore[key] || null),
      set: jest.fn((key: string, value: string) => {
        mockStore[key] = value;
      }),
      delete: jest.fn((key: string) => {
        delete mockStore[key];
      }),
    },
    client: {
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    },
  };
});

const TestComponent: React.FC = () => {
  const { token, isAuthenticated, loading, ready, logout } = useAuth();

  return (
    <div>
      <p data-testid="token">{token}</p>
      <p data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</p>
      <p data-testid="loading">{loading ? 'true' : 'false'}</p>
      <p data-testid="ready">{ready ? 'true' : 'false'}</p>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading and ready states', async () => {
    (authStorage.getString as jest.Mock).mockImplementation((key) => {
      if (key === HEADER_KEYS.ACCESS_TOKEN) {
        return 'mockToken';
      }
      if (key === HEADER_KEYS.EXPIRY) {
        return '2100-01-01T00:00:00.000Z';
      }
      return null;
    });

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('ready').textContent).toBe('false');

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('ready').textContent).toBe('true');
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('token').textContent).toBe('mockToken');
  });

  it('should handle expired token', async () => {
    (authStorage.getString as jest.Mock).mockImplementation((key) => {
      if (key === HEADER_KEYS.ACCESS_TOKEN) {
        return 'expiredToken';
      }
      if (key === HEADER_KEYS.EXPIRY) {
        return '2000-01-01T00:00:00.000Z';
      }
      return null;
    });

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('token').textContent).toBe('');
  });

  it('should clear storage and state on logout', async () => {
    (authStorage.getString as jest.Mock).mockImplementation((key) => {
      if (key === HEADER_KEYS.ACCESS_TOKEN) {
        return 'mockToken';
      }
      if (key === HEADER_KEYS.EXPIRY) {
        return '2100-01-01T00:00:00.000Z';
      }
      return null;
    });

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );

    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(authStorage.delete).toHaveBeenCalledWith(HEADER_KEYS.ACCESS_TOKEN);
    expect(authStorage.delete).toHaveBeenCalledWith(HEADER_KEYS.REFRESH_TOKEN);
    expect(authStorage.delete).toHaveBeenCalledWith(HEADER_KEYS.USER_ID);
    expect(authStorage.delete).toHaveBeenCalledWith(HEADER_KEYS.EXPIRY);

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('token').textContent).toBe('');
  });
});
