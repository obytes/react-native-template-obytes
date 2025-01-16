import dayjs from 'dayjs';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { MMKV } from 'react-native-mmkv';

import { client } from '@/api';

const unauthorizedHttpStatusCode = 401;

const storageKey = 'auth-storage';

export const authStorage = new MMKV({
  id: storageKey,
});

export const HEADER_KEYS = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'client',
  USER_ID: 'uid',
  EXPIRY: 'expiry',
  AUTHORIZATION: 'Authorization',
};

export const storeTokens = (args: {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiration: string;
}) => {
  authStorage.set(HEADER_KEYS.ACCESS_TOKEN, args.accessToken);
  authStorage.set(HEADER_KEYS.REFRESH_TOKEN, args.refreshToken);
  authStorage.set(HEADER_KEYS.USER_ID, args.userId);
  authStorage.set(HEADER_KEYS.EXPIRY, args.expiration);
};

export const getTokenDetails = () => ({
  accessToken: authStorage.getString(HEADER_KEYS.ACCESS_TOKEN) ?? '',
  refreshToken: authStorage.getString(HEADER_KEYS.REFRESH_TOKEN) ?? '',
  userId: authStorage.getString(HEADER_KEYS.USER_ID) ?? '',
  expiration: authStorage.getString(HEADER_KEYS.EXPIRY) ?? '',
});

export const clearTokens = () => {
  authStorage.delete(HEADER_KEYS.ACCESS_TOKEN);
  authStorage.delete(HEADER_KEYS.REFRESH_TOKEN);
  authStorage.delete(HEADER_KEYS.USER_ID);
  authStorage.delete(HEADER_KEYS.EXPIRY);
};

// Request interceptor to add Authorization header
client.interceptors.request.use(
  (config) => {
    const { accessToken, expiration } = getTokenDetails();

    // Check if token is expired
    if (dayjs().isAfter(dayjs(expiration))) {
      // TODO
      // Handle token refresh logic
    }

    if (accessToken) {
      config.headers[HEADER_KEYS.AUTHORIZATION] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle tokens
client.interceptors.response.use(
  (response) => {
    const accessToken = response.headers[HEADER_KEYS.ACCESS_TOKEN] || '';
    const refreshToken = response.headers[HEADER_KEYS.REFRESH_TOKEN] || '';
    const userId = response.headers[HEADER_KEYS.USER_ID] || '';

    const expiration = response.headers[HEADER_KEYS.EXPIRY]
      ? dayjs.unix(parseInt(response.headers[HEADER_KEYS.EXPIRY])).toISOString()
      : dayjs().add(1, 'hour').toISOString();

    if (accessToken && refreshToken && userId && expiration) {
      storeTokens({ accessToken, refreshToken, userId, expiration });
    }

    return response;
  },
  (error) => Promise.reject(error),
);

interface AuthContextProps {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  ready: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const checkToken = useCallback(() => {
    const storedToken = authStorage.getString(HEADER_KEYS.ACCESS_TOKEN);
    const expiration = authStorage.getString(HEADER_KEYS.EXPIRY);

    if (!storedToken || !expiration) {
      setToken(null);
      setLoading(false);
      setReady(true);
      return;
    }

    const isExpired = dayjs().isAfter(dayjs(expiration));

    if (isExpired) {
      setToken(null); // Token expired, clear it
    } else {
      setToken(storedToken); // Token is valid, set it
    }

    setLoading(false);
    setReady(true);
  }, []);

  const logout = () => {
    clearTokens();
    setToken(null);
  };

  useEffect(() => {
    try {
      checkToken();
    } catch {
      setReady(true);
    }
    const requestInterceptor = client.interceptors.response.use(
      (config) => {
        if (config.status === unauthorizedHttpStatusCode) {
          logout();
        }
        checkToken();
        return config;
      },
      (error) => Promise.reject(error),
    );

    return () => {
      client.interceptors.request.eject(requestInterceptor);
    };
  }, [checkToken]);
  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        ready,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
