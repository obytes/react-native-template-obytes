import type * as Notifications from 'expo-notifications';

import { router } from 'expo-router';

import { handleNotificationResponse } from '@/features/notifications/deep-link';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

function makeResponse(data: unknown): Notifications.NotificationResponse {
  return {
    notification: {
      request: {
        content: { data },
      },
    },
  } as unknown as Notifications.NotificationResponse;
}

describe('handleNotificationResponse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes horse pushes to the horse profile', () => {
    handleNotificationResponse(makeResponse({ screen: 'horse', horseId: 'h-1' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/stables/[horse-id]',
      params: { 'horse-id': 'h-1' },
    });
  });

  it('routes news pushes to the news post', () => {
    handleNotificationResponse(makeResponse({ screen: 'news', newsPostId: 'n-1' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/news/[news-post-id]',
      params: { 'news-post-id': 'n-1' },
    });
  });

  it('routes event pushes to the event detail screen', () => {
    handleNotificationResponse(makeResponse({ screen: 'event', eventId: 'e-1' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/event/[event-id]',
      params: { 'event-id': 'e-1' },
    });
  });

  it('routes poll pushes to the poll screen', () => {
    handleNotificationResponse(makeResponse({ screen: 'poll', pollId: 'p1' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/poll/[poll-id]',
      params: { 'poll-id': 'p1' },
    });
  });

  it('routes insideTrack pushes to /inside-track', () => {
    handleNotificationResponse(makeResponse({ screen: 'insideTrack' }));

    expect(router.push).toHaveBeenCalledWith('/inside-track');
  });

  it('still ignores unknown screens', () => {
    handleNotificationResponse(makeResponse({ screen: 'nope' }));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('routes post pushes to the native post screen', () => {
    handleNotificationResponse(makeResponse({ screen: 'post', spaceId: 's1', postId: 'p1' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/post/[space-id]/[post-id]',
      params: { 'space-id': 's1', 'post-id': 'p1' },
    });
  });

  it('routes spaceFeed pushes to the space feed', () => {
    handleNotificationResponse(makeResponse({ screen: 'spaceFeed', spaceId: 's1' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/space-feed/[space-id]',
      params: { 'space-id': 's1' },
    });
  });

  it('routes notifications pushes to the centre', () => {
    handleNotificationResponse(makeResponse({ screen: 'notifications' }));
    expect(router.push).toHaveBeenCalledWith('/notifications');
  });

  it('routes community pushes carrying a post natively', () => {
    handleNotificationResponse(makeResponse({ screen: 'community', url: 'https://c/x', spaceId: 's1', postId: 'p1' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/post/[space-id]/[post-id]',
      params: { 'space-id': 's1', 'post-id': 'p1' },
    });
  });

  it('routes community pushes carrying only a space to the space feed', () => {
    handleNotificationResponse(makeResponse({ screen: 'community', spaceId: 's1' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/space-feed/[space-id]',
      params: { 'space-id': 's1' },
    });
  });

  it('routes legacy community pushes to the Community tab, never the WebView', () => {
    handleNotificationResponse(makeResponse({ screen: 'community', url: 'https://c/x' }));
    expect(router.push).toHaveBeenCalledWith('/(app)/community');
  });

  it('ignores malformed payloads', () => {
    handleNotificationResponse(makeResponse({ screen: 'post', spaceId: 's1' }));
    handleNotificationResponse(makeResponse({ screen: 'spaceFeed' }));
    handleNotificationResponse(makeResponse({ screen: 'community', spaceId: 7 }));
    expect(router.push).not.toHaveBeenCalled();
  });
});
