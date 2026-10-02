import type { MemberContentState, MemberFeedItem } from '@/features/member-content/types';

import Env from 'env';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import {
  ActivityIndicator,
  EmptyState,
  ErrorState,
  IconButton,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { usePostableSpaces } from '@/features/community-posting/api/use-postable-spaces';
import { PlusGlyph } from '@/features/community-posting/components/plus-glyph';
import { usePostLike } from '@/features/member-content/api/use-post-like';
import { useSpaceFeed } from '@/features/member-content/api/use-space-feed';
import { FeedItemRenderer } from '@/features/member-content/components/feed-item-renderer';
import { usePollVote } from '@/features/polls/api/use-poll-vote';

type SpaceFeedViewProps = {
  title: string;
  items: MemberFeedItem[] | undefined;
  contentState: MemberContentState;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onOpenPost: (spaceId: string, postId: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  pendingLikePostId?: string | null;
  onVote: (pollId: string, optionId: string) => void;
  pendingVotePollIds: string[];
  onBack?: () => void;
  /** Header "+" (new post) — only passed when the space is postable. */
  onNewPost?: () => void;
};

// Stories are merged into the Community feed only, never per-space feeds, so
// FeedItemRenderer's onOpenStory is wired to a no-op here.
function noOpOpenStory() {}

export function SpaceFeedView({
  title,
  items,
  contentState,
  isLoading,
  isRefetching,
  onRefresh,
  onOpenPost,
  onToggleLike,
  pendingLikePostId,
  onVote,
  pendingVotePollIds,
  onBack,
  onNewPost,
}: SpaceFeedViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      <ScreenHeader
        kicker="Discussion"
        title={title}
        onBack={onBack}
        right={onNewPost
          ? (
              <IconButton
                testID="space-feed-new-post"
                variant="square-accent"
                accessibilityLabel="New post"
                onPress={onNewPost}
                // The header's right slot pulls 12pt outward for bare icons;
                // a filled button must sit on the 16pt gutter like the cards.
                className="mr-3 size-11"
              >
                <PlusGlyph size={20} />
              </IconButton>
            )
          : undefined}
        className="pb-6"
      />

      <View className="gap-3 px-4">
        {isLoading && !items
          ? (
              <View testID="space-feed-loading" className="items-center py-16">
                <ActivityIndicator />
                <Text variant="body" className="mt-3 text-ink-variant">Loading the discussion…</Text>
              </View>
            )
          : null}
        {!isLoading && contentState === 'empty'
          ? (
              <EmptyState
                testID="space-feed-empty"
                title="No posts yet"
                body="Updates and discussion for this horse will appear here."
              />
            )
          : null}
        {!isLoading && contentState === 'unavailable'
          ? (
              <ErrorState
                testID="space-feed-unavailable"
                title="Discussion unavailable"
                body="Check your connection and try again."
                onRetry={onRefresh}
              />
            )
          : null}
        {items?.map(item => (
          <FeedItemRenderer
            key={item.id}
            item={item}
            onOpen={onOpenPost}
            onToggleLike={onToggleLike}
            likePending={pendingLikePostId === item.id}
            onVote={onVote}
            votePending={item.poll ? pendingVotePollIds.includes(item.poll.id) : false}
            onOpenStory={noOpOpenStory}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export function SpaceFeedScreen() {
  const params = useLocalSearchParams<{ 'space-id': string; 'name'?: string }>();
  const spaceId = params['space-id'] ?? '';
  const title = params.name?.trim() || 'Discussion';
  const router = useRouter();
  const member = useAuthStore.use.user();

  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: member?.id ?? '' }),
    [member?.id],
  );
  const feed = useSpaceFeed(scope, spaceId);
  const like = usePostLike(scope);
  const poll = usePollVote(scope);
  const spacesQuery = usePostableSpaces(scope);
  const isPostable = (spacesQuery.data?.spaces ?? []).some(space => space.id === spaceId);

  if (!member) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpaceFeedView
        title={title}
        items={feed.data}
        contentState={feed.contentState}
        isLoading={feed.isLoading}
        isRefetching={feed.isRefetching}
        onRefresh={() => void feed.refetch()}
        onOpenPost={(postSpaceId, postId) => router.push(
          `/post/${encodeURIComponent(postSpaceId)}/${encodeURIComponent(postId)}`,
        )}
        onToggleLike={(postId, liked) => like.toggleLike({ postId, liked })}
        pendingLikePostId={like.pendingPostId}
        onVote={(pollId, optionId) => poll.vote({ pollId, optionId })}
        pendingVotePollIds={poll.pendingPollIds}
        onBack={() => router.back()}
        onNewPost={isPostable
          ? () => router.push(`/post/new?spaceId=${encodeURIComponent(spaceId)}`)
          : undefined}
      />
    </>
  );
}
