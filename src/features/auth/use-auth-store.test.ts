import { clearCircleWebViewCookies } from '@/features/community/lib/circle-cookie-clear';
import { clearEventsStorage } from '@/features/events/lib/events-logout';
import { clearMemberContentForMember } from '@/features/member-content/lib/member-content-logout';
import { clearInboxStorage } from '@/features/notification-centre/lib/inbox-logout';
import { client } from '@/lib/api/client';
import { removeItem } from '@/lib/storage';

import { signOut, useAuthStore } from './use-auth-store';

jest.mock('env', () => ({
  __esModule: true,
  default: { EXPO_PUBLIC_CLUB_ID: 'org-1' },
}));

jest.mock('@/lib/api/client', () => ({
  client: { post: jest.fn().mockResolvedValue({ data: {} }) },
}));

jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  removeItemsWithPrefix: jest.fn(),
}));

jest.mock('@/features/community/lib/circle-cookie-clear', () => ({
  clearCircleWebViewCookies: jest.fn().mockResolvedValue('cleared'),
}));

jest.mock('@/features/events/lib/events-logout', () => ({
  clearEventsStorage: jest.fn(),
}));

jest.mock('@/features/member-content/lib/member-content-logout', () => ({
  clearMemberContentForMember: jest.fn(),
}));

jest.mock('@/features/notification-centre/lib/inbox-logout', () => ({
  clearInboxStorage: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: false,
}));

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears legacy Circle keys, clears WebView cookies, clears feature caches and never revokes a server-side Circle session', async () => {
    await signOut();

    expect(removeItem).toHaveBeenCalledWith('circle.session.v1');
    expect(removeItem).toHaveBeenCalledWith('circle.communityBaseUrl.v1');
    expect(clearCircleWebViewCookies).toHaveBeenCalled();
    expect(clearInboxStorage).toHaveBeenCalled();
    expect(clearEventsStorage).toHaveBeenCalled();
    expect(client.post).not.toHaveBeenCalledWith(
      '/api/circle/revoke-session',
      expect.anything(),
    );
    expect(useAuthStore.getState().status).toBe('signOut');
  });

  it('still completes sign-out when clearing Circle WebView cookies rejects', async () => {
    (clearCircleWebViewCookies as jest.Mock).mockRejectedValueOnce(new Error('native module missing'));

    await signOut();

    expect(useAuthStore.getState().status).toBe('signOut');
  });

  it('clears the member content cache for the signed-in member', async () => {
    useAuthStore.setState({
      status: 'signIn',
      token: 'token-1',
      user: { id: 'member-1', email: 'member@example.com' },
    });

    await signOut();

    expect(clearMemberContentForMember).toHaveBeenCalledWith({
      organizationId: 'org-1',
      memberId: 'member-1',
    });
  });
});
