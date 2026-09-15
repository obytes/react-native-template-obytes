import type * as NotificationsType from 'expo-notifications';

import Env from 'env';

import { fetchInboxBadge } from '@/features/notification-centre/api/use-inbox-badge';

let Notifications: typeof NotificationsType | null = null;
try {
  Notifications = require('expo-notifications');
}
catch {
  Notifications = null;
}

export async function syncNotificationBadgeCount(): Promise<number> {
  if (!Notifications?.setBadgeCountAsync)
    return 0;

  try {
    const count = await fetchInboxBadge(Env.EXPO_PUBLIC_CLUB_ID);
    await Notifications.setBadgeCountAsync(Math.min(99, count));
    return count;
  }
  catch (err) {
    console.warn('Failed to sync notification badge count', err);
    return 0;
  }
}

export async function clearNotificationBadgeCount(): Promise<void> {
  if (!Notifications?.setBadgeCountAsync)
    return;

  try {
    await Notifications.setBadgeCountAsync(0);
  }
  catch {
    // Best effort only.
  }
}
