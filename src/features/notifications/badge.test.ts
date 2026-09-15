const mockSetBadgeCountAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  setBadgeCountAsync: (...args: unknown[]) => mockSetBadgeCountAsync(...args),
}));

const mockFetchInboxBadge = jest.fn();
jest.mock('@/features/notification-centre/api/use-inbox-badge', () => ({
  fetchInboxBadge: (...args: unknown[]) => mockFetchInboxBadge(...args),
}));

describe('syncNotificationBadgeCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('sets the native badge to the fetched count and returns it', async () => {
    mockFetchInboxBadge.mockResolvedValue(7);
    const { syncNotificationBadgeCount } = require('@/features/notifications/badge');

    const result = await syncNotificationBadgeCount();

    expect(mockSetBadgeCountAsync).toHaveBeenCalledWith(7);
    expect(result).toBe(7);
  });

  it('caps the native badge at 99', async () => {
    mockFetchInboxBadge.mockResolvedValue(250);
    const { syncNotificationBadgeCount } = require('@/features/notifications/badge');

    const result = await syncNotificationBadgeCount();

    expect(mockSetBadgeCountAsync).toHaveBeenCalledWith(99);
    expect(result).toBe(250);
  });

  it('returns 0 and swallows the error when the fetch rejects', async () => {
    mockFetchInboxBadge.mockRejectedValue(new Error('network down'));
    const { syncNotificationBadgeCount } = require('@/features/notifications/badge');

    await expect(syncNotificationBadgeCount()).resolves.toBe(0);
    expect(mockSetBadgeCountAsync).not.toHaveBeenCalled();
  });
});
