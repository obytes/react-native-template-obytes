import { EMAIL_ROWS, INLINE_ROWS, PUSH_ROWS } from '@/features/settings/lib/notification-rows';

describe('notification rows', () => {
  it('lists push alerts without Circle or trainer-post toggles, with comments on my posts', () => {
    expect(PUSH_ROWS.map(r => r.labelKey)).toEqual([
      'settings.notifications.horseDeclared',
      'settings.notifications.raceResult',
      'settings.notifications.horseUpdates',
      'settings.notifications.newsPost',
      'settings.notifications.insideTrack',
      'settings.notifications.events',
      'settings.notifications.polls',
      'settings.notifications.postComments',
    ]);
  });
  it('maps postComments to the backend preference key, default on', () => {
    const row = PUSH_ROWS.find(r => r.labelKey === 'settings.notifications.postComments')!;
    expect(row.get({ pushPreferences: {}, emailPreferences: {} } as never)).toBe(true);
    expect(row.get({ pushPreferences: { postComments: false }, emailPreferences: {} } as never)).toBe(false);
    expect(row.set(false)).toEqual({ pushPreferences: { postComments: false } });
  });
  it('keeps the email row', () => {
    expect(EMAIL_ROWS.map(r => r.labelKey)).toEqual(['settings.notifications.emailNewsPost']);
  });
});

describe('inline rows', () => {
  it('maps the four quick toggles to their backend keys', () => {
    expect(INLINE_ROWS.map(r => r.set(false))).toEqual([
      { pushPreferences: { horseDeclared: false } },
      { pushPreferences: { raceResult: false } },
      { pushPreferences: { horseUpdates: false } },
      { pushPreferences: { postComments: false } },
    ]);
    expect(INLINE_ROWS.every(r => r.get({ pushPreferences: {}, emailPreferences: {} } as never))).toBe(true);
  });
});
