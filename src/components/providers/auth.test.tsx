import { act, renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import dayjs from 'dayjs';

import { fireEvent, render, screen } from '@/core/test-utils';
import { Text, TouchableOpacity, View } from '@/ui';

import {
  AuthProvider,
  clearTokens,
  getTokenDetails,
  storeTokens,
  useAuth,
} from './auth';

// Mock MMKV Storage
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => mockStorage.set(key, value),
      getString: (key: string) => mockStorage.get(key) || null,
      delete: (key: string) => mockStorage.delete(key),
    })),
  };
});

// Mock API client interceptors
jest.mock('@/api', () => ({
  client: {
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

const TestComponent = () => {
  const { token, isAuthenticated, loading, ready, logout } = useAuth();
  return (
    <View>
      <Text testID="token">{token}</Text>
      <Text testID="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      <Text testID="ready">{ready ? 'true' : 'false'}</Text>
      <TouchableOpacity testID="logout" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const mockedAccessToken = 'access-token';
const mockedValidToken = 'valid-token';
const mockedRefreshToken = 'refresh-token';
const mockedExpiryDate = '2025-01-17T00:00:00Z';
const mockedUserId = 'user-id';

describe('Auth Utilities', () => {
  afterEach(() => {
    clearTokens();
  });

  it('stores tokens correctly', () => {
    storeTokens({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });

    const tokens = getTokenDetails();
    expect(tokens).toEqual({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });
  });

  it('clears tokens correctly', () => {
    storeTokens({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });
    clearTokens();

    const tokens = getTokenDetails();
    expect(tokens).toEqual({
      accessToken: '',
      refreshToken: '',
      userId: '',
      expiration: '',
    });
  });
});

describe('AuthProvider', () => {
  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toEqual({
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
      logout: expect.any(Function),
    });
  });

  it('handles token state correctly', async () => {
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: dayjs().add(1, 'hour').toISOString(),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.token).toBe('valid-token');
    expect(result.current.loading).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  it('logs out correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(getTokenDetails()).toEqual({
      accessToken: '',
      refreshToken: '',
      userId: '',
      expiration: '',
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
describe('TestComponent', () => {
  afterEach(() => {
    clearTokens();
  });

  it('renders correctly and handles logout', async () => {
    // Set initial tokens
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: dayjs().add(1, 'hour').toISOString(),
    });

    // Render the component with AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Verify initial state
    expect(screen.getByTestId('token')).toHaveTextContent('valid-token');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');

    // Simulate logout action
    fireEvent.press(screen.getByTestId('logout'));

    // Verify state after logout
    expect(screen.getByTestId('token')).toHaveTextContent('');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');
  });
});
