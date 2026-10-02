import type { MemberContentState, MemberFeedItem } from '@/features/member-content/types';

import Env from 'env';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import colors from '@/components/ui/colors';
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
    <View className="mb-4">
      <Text className="font-mono text-[10px] tracking-widest text-label uppercase">
        {eyebrow}
      </Text>
      <Text className="mt-2 font-sans-semibold text-2xl text-ink">{title}</Text>
    </View>
  );
}

function EmptyState({
  testID,
  title,
  message,
}: {
  testID: string;
  title: string;
  message: string;
}) {
  return (
    <View testID={testID} className="rounded-2xl border border-outline-variant bg-white p-6">
      <Text className="font-sans-semibold text-lg text-ink">{title}</Text>
      <Text className="mt-2 font-sans text-sm/5 text-ink-variant">{message}</Text>
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
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      {isLoading && !pinned && !latest
        ? (
            <View testID="inside-track-loading" className="items-center py-16">
              <ActivityIndicator color={colors.primary} />
              <Text className="mt-3 font-sans text-sm text-ink-variant">
                Loading the Inside Track…
              </Text>
            </View>
          )
        : null}
      {!isLoading && contentState === 'unavailable'
        ? (
            <EmptyState
              testID="inside-track-unavailable"
              title="Inside Track unavailable"
              message="Check your connection and pull down to try again."
            />
          )
        : null}
      {!isLoading && contentState === 'empty'
        ? (
            <EmptyState
              testID="inside-track-empty"
              title="Nothing here yet"
              message="Educational videos and articles will appear here soon."
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
  const member = useAuthStore.use.user();

  if (!member) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Inside Track' }} />
      <SignedInInsideTrack memberId={member.id} />
    </>
  );
}
