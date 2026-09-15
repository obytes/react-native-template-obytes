export const NOTIFICATION_CENTRE_QUERY_ROOT = 'notification-centre';

export type InboxDeepLink
  = | { screen: 'horse'; horseId: string }
    | { screen: 'news'; newsPostId: string }
    | { screen: 'event'; eventId: string }
    | { screen: 'poll'; pollId: string }
    | { screen: 'insideTrack' }
    | { screen: 'post'; spaceId: string; postId: string }
    | { screen: 'spaceFeed'; spaceId: string };

export type InboxIcon = 'horse' | 'actor' | 'club';

export type InboxItem = {
  id: string;
  kind: string;
  icon: InboxIcon;
  title: string;
  body: string;
  imageUrl: string | null;
  actorAvatarUrl: string | null;
  data: InboxDeepLink;
  unread: boolean;
  updatedAt: string; // ISO
};

export type InboxPage = { items: InboxItem[]; nextCursor: string | null };
export type InboxSectionKey = 'today' | 'week' | 'earlier';
