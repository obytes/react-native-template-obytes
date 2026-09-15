import type * as DeviceType from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import type { AuthUser, TokenType } from '@/lib/auth/utils';

import Env from 'env';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { clearCircleWebViewCookies } from '@/features/community/lib/circle-cookie-clear';
import {
  clearCachedCircleSession,
  getCachedCircleSession,
} from '@/features/community/lib/circle-session-store';
import { resetCommunityPanel } from '@/features/community/lib/use-community-panel-store';
import { clearEventsStorage } from '@/features/events/lib/events-logout';
import { clearMemberContentForMember } from '@/features/member-content/lib/member-content-logout';
import { clearInboxStorage } from '@/features/notification-centre/lib/inbox-logout';
import { client } from '@/lib/api/client';
import { bootstrapMobileOrganization } from '@/lib/auth/mobile-org-bootstrap';
import {
  getToken,
  getUser,
  removeToken,
  removeUser,
  setToken,
  setUser,
} from '@/lib/auth/utils';
import { removeItem } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// MUST stay in sync with use-community-session.ts / circle-prewarm.ts
// (COMMUNITY_BASE_URL_KEY). The cached community base URL lives in its own MMKV
// key; we clear it on sign-out alongside the cached session token.
const CIRCLE_COMMUNITY_BASE_URL_KEY = 'circle.communityBaseUrl.v1';

/**
 * Invalidate the Circle session on sign-out, three independent ways, in order.
 * S6-03 B5 + S6-04. Every step is best-effort: a failure in any one MUST NOT
 * block the rest, nor block logout. Call this BEFORE clearing local auth state —
 * step 1 needs the cached Circle access token to revoke it server-side.
 *
 *   1. Server-side token revoke (deterministic) — revokes the member's Circle
 *      access + refresh tokens and clears the stored refresh token server-side.
 *   2. Clear the on-device token cache (deterministic) — cached session token
 *      and the cached community base URL.
 *   3. Clear the LIVE WebView session (S6-04, best-effort, device-bound) — a
 *      local Expo module (modules/circle-cookies) clears WK cookies, the
 *      app-level HTTPCookieStorage.shared, and all web storage so a different
 *      member signing in within the SAME app instance gets a clean Circle
 *      session (no restart). Replaces the old hidden-/users/sign_out flush,
 *      which only expired the on-disk cookies and left the §E leak open.
 */
async function invalidateCircleSession(): Promise<void> {
  // Step 1 — server-side revoke (deterministic). Read the cached access token
  // BEFORE clearing the cache; swallow any failure.
  const cached = getCachedCircleSession();
  if (cached?.accessToken) {
    try {
      await client.post('/api/circle/revoke-session', {
        accessToken: cached.accessToken,
      });
    }
    catch (e) {
      console.warn('[auth] Circle revoke-session failed (continuing logout):', e);
    }
  }

  // Step 2 — clear the on-device caches (deterministic): the session token and
  // the cached community base URL key.
  try {
    clearCachedCircleSession();
    void removeItem(CIRCLE_COMMUNITY_BASE_URL_KEY);
  }
  catch (e) {
    console.warn('[auth] Failed to clear cached Circle session (continuing logout):', e);
  }

  // Step 3 — clear the LIVE WebView session (S6-04). Unlike the superseded hidden
  // /users/sign_out flush (on-disk only), the local native module clears WK
  // cookies (+ HTTPCookieStorage.shared, which sharedCookiesEnabled would
  // otherwise resurrect) and all web storage, closing the cross-user §E hole
  // within a single app instance. Best-effort — logs but never blocks logout.
  try {
    await clearCircleWebViewCookies();
  }
  catch (e) {
    console.warn('[auth] Failed to clear live Circle WebView cookies (continuing logout):', e);
  }
}

/**
 * Clear every per-member feature cache on sign-out (member content, events,
 * notification centre): best-effort, so one feature's failure never blocks
 * the rest or logout itself. Call AFTER the Circle session teardown.
 */
function clearFeatureCaches(signedInMember: AuthUser | null): void {
  if (signedInMember) {
    try {
      clearMemberContentForMember({
        organizationId: Env.EXPO_PUBLIC_CLUB_ID,
        memberId: signedInMember.id,
      });
    }
    catch (e) {
      console.warn('[auth] Failed to clear member content (continuing logout):', e);
    }
  }

  // Clear every persisted events snapshot (any member/org) + the in-memory
  // events query cache so the next member on this device starts clean.
  try {
    clearEventsStorage();
  }
  catch (e) {
    console.warn('[auth] Failed to clear events cache (continuing logout):', e);
  }

  try {
    clearInboxStorage();
  }
  catch (e) {
    console.warn('[auth] Failed to clear notification centre cache (continuing logout):', e);
  }
}

type AuthState = {
  token: TokenType | null;
  user: AuthUser | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (token: TokenType, user: AuthUser) => void;
  signOut: () => Promise<void>;
  hydrate: () => void;
};

const _useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (token, user) => {
    setToken(token);
    setUser(user);
    set({ status: 'signIn', token, user });
  },
  signOut: async () => {
    const signedInMember = get().user;
    // Lazy-require native modules so sign-out still works on a dev client that
    // hasn't been rebuilt with expo-device / expo-notifications yet.
    let Device: typeof DeviceType | null = null;
    let Notifications: typeof NotificationsType | null = null;
    try {
      Device = require('expo-device');
    }
    catch {}
    try {
      Notifications = require('expo-notifications');
    }
    catch {}

    if (Device?.isDevice && Notifications) {
      let expoPushToken: string | null = null;
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        expoPushToken = token?.data ?? null;
      }
      catch (e) {
        console.warn('Failed to get Expo push token during sign-out:', e);
      }

      if (expoPushToken) {
        try {
          await client.post('/api/push/unregister', { expoPushToken });
        }
        catch (e) {
          console.warn('Failed to unregister Expo push token:', e);
        }
      }
    }

    // S6-03 B5: invalidate the Circle session (server revoke + cache clear +
    // best-effort cookie flush) BEFORE clearing local auth state — the
    // server-side revoke needs the cached Circle access token. Best-effort:
    // any failure inside here is swallowed and never blocks logout.
    await invalidateCircleSession();

    // S6-05: tear down the persistent Community panel. With the cookies/web
    // storage cleared above, unmounting the singleton (activated=false) is the
    // one correct teardown — the next member's open mounts a fresh WebView with
    // THEIR token. Best-effort; never blocks logout.
    try {
      resetCommunityPanel();
    }
    catch (e) {
      console.warn('[auth] Failed to reset Community panel (continuing logout):', e);
    }

    clearFeatureCaches(signedInMember);

    removeToken();
    removeUser();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      const userData = getUser();
      if (userToken !== null) {
        set({ status: 'signIn', token: userToken, user: userData });
        bootstrapMobileOrganization().catch((e) => {
          console.warn('Mobile organization bootstrap failed during hydration:', e);
        });
      }
      else {
        get().signOut();
      }
    }
    catch (e) {
      console.error('Auth hydration error:', e);
      get().signOut();
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export function signOut() {
  return _useAuthStore.getState().signOut();
}
export function signIn(token: TokenType, user: AuthUser) {
  return _useAuthStore.getState().signIn(token, user);
}
export function getAuthStatus() {
  return _useAuthStore.getState().status;
}
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
