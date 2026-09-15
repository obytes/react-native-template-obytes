import type { UserPreferences } from '@/features/settings/api/use-preferences';

import type { translate } from '@/lib/i18n';

export type Row = {
  labelKey: Parameters<typeof translate>[0];
  get: (prefs: UserPreferences) => boolean;
  set: (value: boolean) => Partial<UserPreferences>;
};

export const PUSH_ROWS: Row[] = [
  {
    labelKey: 'settings.notifications.horseDeclared',
    get: p => p.pushPreferences.horseDeclared !== false,
    set: v => ({ pushPreferences: { horseDeclared: v } }),
  },
  {
    labelKey: 'settings.notifications.raceResult',
    get: p => p.pushPreferences.raceResult !== false,
    set: v => ({ pushPreferences: { raceResult: v } }),
  },
  {
    labelKey: 'settings.notifications.horseUpdates',
    get: p => p.pushPreferences.horseUpdates !== false,
    set: v => ({ pushPreferences: { horseUpdates: v } }),
  },
  {
    labelKey: 'settings.notifications.newsPost',
    get: p => p.pushPreferences.newsPost !== false,
    set: v => ({ pushPreferences: { newsPost: v } }),
  },
  {
    labelKey: 'settings.notifications.insideTrack',
    get: p => p.pushPreferences.insideTrack !== false,
    set: v => ({ pushPreferences: { insideTrack: v } }),
  },
  {
    labelKey: 'settings.notifications.events',
    get: p => p.pushPreferences.events !== false,
    set: v => ({ pushPreferences: { events: v } }),
  },
  {
    labelKey: 'settings.notifications.polls',
    get: p => p.pushPreferences.polls !== false,
    set: v => ({ pushPreferences: { polls: v } }),
  },
  {
    labelKey: 'settings.notifications.postComments',
    get: p => p.pushPreferences.postComments !== false,
    set: v => ({ pushPreferences: { postComments: v } }),
  },
];

export const EMAIL_ROWS: Row[] = [
  {
    labelKey: 'settings.notifications.emailNewsPost',
    get: p => p.emailPreferences.newsPost !== false,
    set: v => ({ emailPreferences: { newsPost: v } }),
  },
];
