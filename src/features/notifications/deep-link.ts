import type * as Notifications from 'expo-notifications';

import type { InboxDeepLink } from '@/features/notification-centre/types';

import { router } from 'expo-router';

export type PushData
  = | InboxDeepLink
    | { screen: 'community'; url?: string; spaceId?: string; postId?: string }
    | { screen: 'notifications' };

const isString = (v: unknown): v is string => typeof v === 'string';
const isOptionalString = (v: unknown) => v === undefined || typeof v === 'string';

const VALIDATORS: Record<string, (d: Record<string, unknown>) => boolean> = {
  horse: d => isString(d.horseId),
  news: d => isString(d.newsPostId),
  event: d => isString(d.eventId),
  poll: d => isString(d.pollId),
  insideTrack: () => true,
  post: d => isString(d.spaceId) && isString(d.postId),
  spaceFeed: d => isString(d.spaceId),
  notifications: () => true,
  community: d => isOptionalString(d.url) && isOptionalString(d.spaceId) && isOptionalString(d.postId),
};

export function isPushData(data: unknown): data is PushData {
  if (!data || typeof data !== 'object')
    return false;
  const d = data as Record<string, unknown>;
  const validate = isString(d.screen) ? VALIDATORS[d.screen] : undefined;
  return validate ? validate(d) : false;
}

function pushPost(spaceId: string, postId: string) {
  router.push({ pathname: '/post/[space-id]/[post-id]', params: { 'space-id': spaceId, 'post-id': postId } });
}

function pushSpaceFeed(spaceId: string) {
  router.push({ pathname: '/space-feed/[space-id]', params: { 'space-id': spaceId } });
}

export function routeToTarget(data: PushData): void {
  switch (data.screen) {
    case 'horse':
      router.push({ pathname: '/stables/[horse-id]', params: { 'horse-id': data.horseId } });
      return;
    case 'news':
      router.push({ pathname: '/news/[news-post-id]', params: { 'news-post-id': data.newsPostId } });
      return;
    case 'event':
      router.push({ pathname: '/event/[event-id]', params: { 'event-id': data.eventId } });
      return;
    case 'poll':
      router.push({ pathname: '/poll/[poll-id]', params: { 'poll-id': data.pollId } });
      return;
    case 'insideTrack':
      router.push('/inside-track');
      return;
    case 'post':
      pushPost(data.spaceId, data.postId);
      return;
    case 'spaceFeed':
      pushSpaceFeed(data.spaceId);
      return;
    case 'notifications':
      router.push('/notifications');
      return;
    case 'community':
      if (data.spaceId && data.postId)
        pushPost(data.spaceId, data.postId);
      else if (data.spaceId)
        pushSpaceFeed(data.spaceId);
      else
        router.push('/(app)/community');
  }
}

export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data;
  if (isPushData(data))
    routeToTarget(data);
}
