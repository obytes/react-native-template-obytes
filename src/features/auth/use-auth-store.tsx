import type * as DeviceType from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import type { AuthUser, TokenType } from '@/lib/auth/utils';

import Env from 'env';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { clearCircleWebViewCookies } from '@/features/community/lib/circle-cookie-clear';
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

// Legacy MMKV keys from the retired Circle WebView build (S6-03/S6-04). The
// app is now fully native — nothing writes these keys any more — but a device
// upgrading from a WebView build may still have them on disk, so we keep
// clearing them best-effort on sign-out.
const CIRCLE_SESSION_KEY = 'circle.session.v1';
const CIRCLE_COMMUNITY_BASE_URL_KEY = 'circle.communityBaseUrl.v1';

/**
 * Best-effort cleanup of the retired Circle WebView's on-device state on
 * sign-out. There is no server-side revoke any more (the WebView, and the
 * session it held, are gone) — this only clears state a pre-native-migration
 * install may still be carrying:
 *
 *   1. The legacy cached-session MMKV keys (session token + community base
 *      URL), in case a device upgrading from a WebView build still has them.
 *   2. The live WebView cookies / web storage (modules/circle-cookies), in
 *      case a device upgrading from a WebView build still has an active
 *      Circle cookie session that could otherwise leak across members.
 *
 * Every step is best-effort: a failure in either MUST NOT block the rest, nor
 * block logout.
 */
async function clearLegacyCircleState(): Promise<void> {
  try {
    void removeItem(CIRCLE_SESSION_KEY);
    void removeItem(CIRCLE_COMMUNITY_BASE_URL_KEY);
  }
  catch (e) {
    console.warn('[auth] Failed to clear legacy Circle session keys (continuing logout):', e);
  }

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

    // Best-effort cleanup of any legacy Circle WebView state a device
    // upgrading from a pre-native build may still be carrying. Never blocks
    // logout.
    await clearLegacyCircleState();

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
