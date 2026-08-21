import { getClerkInstance } from '@clerk/expo';
import axios from 'axios';
import Env from 'env';

// Resolved lazily and with an explicit key: this module is imported during app
// startup, before ClerkProvider has initialized the singleton, and a bare
// getClerkInstance() call in that window throws MissingPublishableKeyError.
function getClerk() {
  return getClerkInstance({
    publishableKey: Env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
}

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
});

// Request interceptor to attach Clerk JWT
client.interceptors.request.use(async (config) => {
  try {
    const session = getClerk().session;
    if (session) {
      const token = await session.getToken({
        template: Env.EXPO_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined,
      });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  catch (err) {
    // If no token (e.g., not signed in), proceed without auth header.
    console.warn('Failed to get Clerk token:', err);
  }
  return config;
});

// Response interceptor: a 401 means the session is no longer valid, so drop it
// and let the route guard redirect. Nothing is retried — the previous _retry
// flag was set on a per-request config object that is never reused.
client.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await getClerk().signOut();
      }
      catch (signOutErr) {
        console.error('Sign out error:', signOutErr);
      }
    }
    return Promise.reject(error);
  },
);
