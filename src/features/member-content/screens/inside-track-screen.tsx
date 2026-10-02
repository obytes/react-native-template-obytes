import type { MemberContentState, MemberFeedItem } from '@/features/member-content/types';

import Env from 'env';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';

// Direct module paths (not the barrel) so the screen's test can mock the barrel's Image alone.
import { ActivityIndicator } from '@/components/ui/activity-indicator';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { MonoLabel } from '@/components/ui/mono-label';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useInsideTrack } from '@/features/member-content/api/use-inside-track';
import { usePostLike } from '@/features/member-content/api/use-post-like';
import { MemberFeedCard } from '@/features/member-content/components/member-feed-card';

type InsideTrackViewProps = {
  pinned: MemberFeedItem[] | undefined;
  latest: MemberFeedItem[] | undefined;
  contentState: MemberContentState;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onOpenPost: (spaceId: string, postId: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  pendingLikePostId?: string | null;
};

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View className="mb-4 gap-2">
      <MonoLabel>{eyebrow}</MonoLabel>
      <Text variant="display-sm" accessibilityRole="header">{title}</Text>
    </View>
  );
}

function FeedCards({
  items,
  onOpenPost,
  onToggleLike,
  pendingLikePostId,
}: {
  items: MemberFeedItem[];
  onOpenPost: (spaceId: string, postId: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  pendingLikePostId?: string | null;
}) {
  return (
    <>
      {items.map(item => (
        <MemberFeedCard
          key={item.id}
          item={item}
          onOpen={onOpenPost}
          onToggleLike={onToggleLike}
          likePending={pendingLikePostId === item.id}
        />
      ))}
    </>
  );
}

export function InsideTrackView({
  pinned,
  latest,
  contentState,
  isLoading,
  isRefetching,
  onRefresh,
  onOpenPost,
  onToggleLike,
  pendingLikePostId,
}: InsideTrackViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-secondary-container"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      <Text variant="display-lg" accessibilityRole="header" className="mb-6">
        Inside Track
      </Text>
      {isLoading && !pinned && !latest
        ? (
            <View testID="inside-track-loading" className="items-center py-16">
              <ActivityIndicator />
              <Text variant="body" className="mt-3 text-ink-variant">
                Loading the Inside Track…
              </Text>
            </View>
          )
        : null}
      {!isLoading && contentState === 'unavailable'
        ? (
            <ErrorState
              testID="inside-track-unavailable"
              title="Inside Track unavailable"
              body="Check your connection and try again."
              onRetry={onRefresh}
              retrying={isRefetching}
            />
          )
        : null}
      {!isLoading && contentState === 'empty'
        ? (
            <EmptyState
              testID="inside-track-empty"
              title="Nothing here yet"
              body="Educational videos and articles will appear here soon."
            />
          )
        : null}
      {pinned && pinned.length > 0
        ? (
            <View className="mb-8 gap-4">
              <SectionHeader eyebrow="Inside Track" title="Start here" />
              <FeedCards
                items={pinned}
                onOpenPost={onOpenPost}
                onToggleLike={onToggleLike}
                pendingLikePostId={pendingLikePostId}
              />
            </View>
          )
        : null}
      {latest && latest.length > 0
        ? (
            <View className="gap-4">
              <SectionHeader eyebrow="Inside Track" title="Latest" />
              <FeedCards
                items={latest}
                onOpenPost={onOpenPost}
                onToggleLike={onToggleLike}
                pendingLikePostId={pendingLikePostId}
              />
            </View>
          )
        : null}
    </ScrollView>
  );
}

function SignedInInsideTrack({ memberId }: { memberId: string }) {
  const router = useRouter();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId }),
    [memberId],
  );
  const insideTrack = useInsideTrack(scope);
  const like = usePostLike(scope);

  return (
    <InsideTrackView
      pinned={insideTrack.data?.pinned}
      latest={insideTrack.data?.latest}
      contentState={insideTrack.contentState}
      isLoading={insideTrack.isLoading}
      isRefetching={insideTrack.isRefetching}
      onRefresh={() => void insideTrack.refetch()}
      onOpenPost={(spaceId, postId) => router.push(
        `/post/${encodeURIComponent(spaceId)}/${encodeURIComponent(postId)}`,
      )}
      onToggleLike={(postId, liked) => like.toggleLike({ postId, liked })}
      pendingLikePostId={like.pendingPostId}
    />
  );
}

export function InsideTrackScreen() {
  const router = useRouter();
  const member = useAuthStore.use.user();

  if (!member) {
    return null;
  }

  return (
    <View className="flex-1 bg-secondary-container">
      <Stack.Screen options={{ headerShown: false }} />
      <FocusAwareStatusBar />
      <ScreenHeader kicker="Club" onBack={() => router.back()} />
      <SignedInInsideTrack memberId={member.id} />
    </View>
  );
}
