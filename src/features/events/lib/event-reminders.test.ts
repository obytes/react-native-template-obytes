import { clubEvent } from '@/features/events/test-fixtures';
import { isPushData } from '@/features/notifications/deep-link';

const mockStore: Record<string, unknown> = {};
jest.mock('@/lib/storage', () => ({
  getItem: (key: string) => mockStore[key] ?? null,
  setItem: async (key: string, value: unknown) => {
    mockStore[key] = JSON.parse(JSON.stringify(value));
  },
}));

const mockNotifications = {
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
};
jest.mock('expo-notifications', () => mockNotifications);

// eslint-disable-next-line import/first
import {
  __resetReminderCacheForTests,
  cancelEventReminder,
  isReminderSet,
  scheduleEventReminder,
} from './event-reminders';

const NOW = new Date('2030-09-01T00:00:00.000Z');

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockStore).forEach(k => delete mockStore[k]);
  __resetReminderCacheForTests();
  mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockNotifications.scheduleNotificationAsync.mockResolvedValue('notif-1');
  mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
});

describe('event reminders', () => {
  it('schedules a local notification 24h before start and persists the id', async () => {
    const outcome = await scheduleEventReminder(clubEvent(), NOW);
    expect(outcome).toBe('scheduled');
    const call = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toBe('Autumn Race Day');
    expect(call.trigger.date.toISOString()).toBe('2030-09-04T10:00:00.000Z');
    expect(isReminderSet('event-1')).toBe(true);
    expect(mockStore['event-reminders']).toEqual({ 'event-1': { id: 'notif-1', startsAt: String(clubEvent().startsAt) } });
  });

  it('survives an app restart (cache cleared, state read back from storage)', async () => {
    await scheduleEventReminder(clubEvent(), NOW);
    __resetReminderCacheForTests();
    expect(isReminderSet('event-1')).toBe(true);
  });

  it('cancels the notification and clears the persisted entry', async () => {
    await scheduleEventReminder(clubEvent(), NOW);
    const outcome = await cancelEventReminder('event-1');
    expect(outcome).toBe('cancelled');
    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
    expect(isReminderSet('event-1')).toBe(false);
    expect(mockStore['event-reminders']).toEqual({});
  });

  it('requests permission when not yet granted, and reports denied', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    expect(await scheduleEventReminder(clubEvent(), NOW)).toBe('denied');
    expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(isReminderSet('event-1')).toBe(false);
  });

  it('reports too-late when start is inside 24h', async () => {
    const event = clubEvent({ startsAt: '2030-09-01T10:00:00.000Z' });
    expect(await scheduleEventReminder(event, NOW)).toBe('too-late');
    expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('never throws when the native module fails', async () => {
    mockNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('boom'));
    expect(await scheduleEventReminder(clubEvent(), NOW)).toBe('failed');
    expect(isReminderSet('event-1')).toBe(false);
  });

  it('schedules a payload the notification deep-link parser accepts', async () => {
    await scheduleEventReminder(clubEvent(), NOW);
    const call = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(isPushData(call.content.data)).toBe(true);
    expect(call.content.data).toEqual({ screen: 'event', eventId: 'event-1' });
  });

  it('prunes reminders for events that have already started', async () => {
    await scheduleEventReminder(clubEvent(), NOW);
    expect(isReminderSet('event-1', NOW)).toBe(true);
    const after = new Date(new Date(clubEvent().startsAt as string).getTime() + 60_000);
    expect(isReminderSet('event-1', after)).toBe(false);
    expect(mockStore['event-reminders']).toEqual({});
  });
});
