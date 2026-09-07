import type { Poll } from '@/features/polls/types';

export type MemberContentScope = {
  organizationId: string;
  memberId: string;
};

export type MemberPostCacheLocator = MemberContentScope & {
  spaceId: string;
  postId: string;
};

export const MEMBER_CONTENT_QUERY_ROOT = 'member-content';

export type MemberFeedItem = {
  id: string;
  spaceId: string | null;
  kind: 'news' | 'post' | 'poll' | 'story';
  /** Present only when kind === 'poll' (S12-01a). */
  poll?: Poll;
  /** Present only when kind === 'story' (S12-02b): a merged news/charity story. */
  story?: { slug: string; category: 'charity' | null };
  title: string;
  excerpt: string | null;
  createdAt: string | null;
  spaceName: string | null;
  authorName: string | null;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  imageUrl: string | null;
  url: string | null;
};

export type MemberFeedResult = {
  ok: boolean;
  items: MemberFeedItem[];
  page: number;
  hasNextPage: boolean;
};

export type InsideTrackResult = {
  ok: boolean;
  configured: boolean;
  pinned: MemberFeedItem[];
  latest: MemberFeedItem[];
};

export type MemberPostDetail = {
  id: string;
  spaceId: string | null;
  title: string;
  bodyHtml: string | null;
  bodyText: string | null;
  imageUrl: string | null;
  tiptapDoc: unknown | null;
  embeds: Record<string, unknown>;
  inlineAttachments: Array<Record<string, unknown>>;
  authorName: string | null;
  authorAvatarUrl: string | null;
  spaceName: string | null;
  createdAt: string | null;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  url: string | null;
  /** Whether the signed-in member authored this post. Absent on older cached posts — treat as false. */
  isOwn?: boolean;
};

export type PostComment = {
  id: string;
  parentCommentId: string | null;
  bodyText: string | null;
  tiptapDoc: Record<string, unknown> | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  createdAt: string | null;
  likeCount: number;
  isLiked: boolean;
  canDelete: boolean;
  replies: PostComment[];
};

export type PostCommentsPage = {
  ok: boolean;
  comments: PostComment[];
  hasNextPage: boolean;
  totalCount: number | null;
};

export type FeedChipKind = 'all' | 'horses' | 'news' | 'charity' | 'polls' | 'space';

export type FeedChip = {
  id: string;
  label: string;
  kind: FeedChipKind;
  spaceIds: string[];
};

export type FeedChipsResult = {
  ok: boolean;
  chips: FeedChip[];
};

export type FeedFilter = {
  kind?: 'poll' | 'story';
  category?: 'charity';
  spaceIds?: string[];
};

export type MemberContentState = 'fresh' | 'saved' | 'empty' | 'unavailable';

export type CachedContent<T> = {
  data: T;
  fetchedAt: number;
};
