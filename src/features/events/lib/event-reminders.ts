import type * as NotificationsModule from 'expo-notifications';
import type { ClubEvent } from '@/features/events/types';
import type * as StorageModule from '@/lib/storage';

import * as React from 'react';

import { reminderTime } from '@/features/events/lib/calendar-grid';

/**
 * Remind-me: a local notification 24h before the event, persisted per event id
 * so the switch state survives restarts.
 *
 * Both expo-notifications and the MMKV-backed storage are native modules, so
 * neither is touched at module top level (house rule: lazy init). They are
 * `require`d inside functions and every call is wrapped in try/catch.
 */
export type ReminderOutcome = 'scheduled' | 'cancelled' | 'denied' | 'too-late' | 'failed';

const STORAGE_KEY = 'event-reminders';

type ReminderEntry = { id: string; startsAt: string }; // notification identifier + event start (for pruning)
type ReminderMap = Record<string, ReminderEntry | string>; // legacy entries were a bare identifier

const entryId = (entry: ReminderEntry | string) => (typeof entry === 'string' ? entry : entry.id);

let cache: ReminderMap | null = null;
const listeners = new Set<() => void>();

function storageModule(): typeof StorageModule | null {
  try {
    return require('@/lib/storage') as typeof StorageModule;
  }
  catch {
    return null;
  }
}

function readMap(): ReminderMap {
  if (cache)
    return cache;
  let value: ReminderMap | null = null;
  try {
    value = storageModule()?.getItem<ReminderMap>(STORAGE_KEY) ?? null;
  }
  catch {
    value = null;
  }
  cache = value && typeof value === 'object' ? value : {};
  return cache;
}

function writeMap(next: ReminderMap) {
  cache = next;
  try {
    void storageModule()?.setItem(STORAGE_KEY, next);
  }
  catch {
    // persistence is best-effort; in-memory state still drives the UI
  }
  listeners.forEach(listener => listener());
}

/** Drop reminders whose event has started so past events never read "Reminding". */
function pruneExpired(now: Date) {
  const map = readMap();
  const kept: ReminderMap = {};
  let changed = false;
  for (const [id, entry] of Object.entries(map)) {
    const startsAt = typeof entry === 'string' ? Number.NaN : Date.parse(entry.startsAt);
    if (!Number.isNaN(startsAt) && startsAt <= now.getTime())
      changed = true;
    else kept[id] = entry;
  }
  if (changed)
    writeMap(kept);
}

export function isReminderSet(eventId: string, now: Date = new Date()): boolean {
  pruneExpired(now);
  return eventId in readMap();
}

function notifications(): typeof NotificationsModule | null {
  try {
    const mod = require('expo-notifications') as typeof NotificationsModule;
    return typeof mod.scheduleNotificationAsync === 'function' ? mod : null;
  }
  catch {
    return null;
  }
}

export async function scheduleEventReminder(
  event: Pick<ClubEvent, 'id' | 'title' | 'startsAt' | 'inPersonLocation'>,
  now: Date = new Date(),
): Promise<ReminderOutcome> {
  try {
    const fireAt = reminderTime(event.startsAt, now);
    if (!fireAt)
      return 'too-late';
    const Notifications = notifications();
    if (!Notifications)
      return 'failed';

    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.status === 'granted';
    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.status === 'granted';
    }
    if (!granted)
      return 'denied';

    // Replace any stale reminder for this event.
    const previous = readMap()[event.id];
    if (previous)
      await Notifications.cancelScheduledNotificationAsync(entryId(previous));

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: event.title,
        body: event.inPersonLocation
          ? `Tomorrow at ${event.inPersonLocation}`
          : 'Starts tomorrow',
        // Shape must satisfy deep-link.ts isPushData (screen: 'event').
        data: { screen: 'event', eventId: event.id },
      },
      // `type: 'date'` is SchedulableTriggerInputTypes.DATE (literal avoids touching the enum).
      trigger: { type: 'date', date: fireAt } as never,
    });
    writeMap({ ...readMap(), [event.id]: { id: identifier, startsAt: String(event.startsAt) } });
    return 'scheduled';
  }
  catch {
    return 'failed';
  }
}

export async function cancelEventReminder(eventId: string): Promise<ReminderOutcome> {
  try {
    const entry = readMap()[eventId];
    const identifier = entry ? entryId(entry) : undefined;
    const { [eventId]: _removed, ...rest } = readMap();
    writeMap(rest);
    if (identifier) {
      await notifications()?.cancelScheduledNotificationAsync(identifier);
    }
    return 'cancelled';
  }
  catch {
    return 'failed';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Shared remind-me state: the list card button and the detail switch toggle the same value. */
export function useEventReminder(event: ClubEvent | undefined) {
  const on = React.useSyncExternalStore(
    subscribe,
    () => (event ? isReminderSet(event.id) : false),
    () => false,
  );
  const [pending, setPending] = React.useState(false);

  const toggle = React.useCallback(async (): Promise<ReminderOutcome> => {
    if (!event)
      return 'failed';
    setPending(true);
    try {
      return isReminderSet(event.id)
        ? await cancelEventReminder(event.id)
        : await scheduleEventReminder(event);
    }
    finally {
      setPending(false);
    }
  }, [event]);

  return { on, pending, toggle };
}

/** Test helper: drop the in-memory cache so the next read hits storage. */
export function __resetReminderCacheForTests() {
  cache = null;
}
