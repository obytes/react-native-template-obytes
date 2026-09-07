import type { FeedChip, MemberContentState, MemberFeedItem } from '@/features/member-content/types';
import type { AuthUser } from '@/lib/auth/utils';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { NewPostButton } from '@/features/community-posting/components/new-post-button';
import { useFeedChips } from '@/features/member-content/api/use-feed-chips';
import { useMemberFeed } from '@/features/member-content/api/use-member-feed';
import { usePostLike } from '@/features/member-content/api/use-post-like';
import { FeedChipRow } from '@/features/member-content/components/feed-chip-row';
import { FeedItemRenderer } from '@/features/member-content/components/feed-item-renderer';
import { chipToFilter } from '@/features/member-content/lib/chip-filter';
import { useFeedChipSelection } from '@/features/member-content/lib/use-feed-chip-selection';
import { usePollVote } from '@/features/polls/api/use-poll-vote';

type CommunityFeedViewProps = {
  member: AuthUser;
  items: MemberFeedItem[] | undefined;
  contentState: MemberContentState;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onOpenPost: (spaceId: string, postId: string) => void;
  onOpenProfile: () => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  pendingLikePostId?: string | null;
  onVote: (pollId: string, optionId: string) => void;
  pendingVotePollIds: string[];
  onOpenStory: (slug: string) => void;
  chips?: FeedChip[];
  selectedChipId?: string;
  onSelectChip?: (id: string) => void;
  emptyCopy?: { title: string; message: string };
};

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
    <View testID={testID} className="rounded-2xl border border-neutral-300 bg-white p-6">
      <Text className="font-sans text-lg font-semibold text-neutral-950">{title}</Text>
      {message
        ? <Text className="mt-2 font-sans text-sm/5 text-neutral-600">{message}</Text>
        : null}
    </View>
  );
}

const DEFAULT_EMPTY_COPY = {
  title: 'Nothing new yet',
  message: 'New updates from your live circles will appear here.',
};

/** Per-chip empty copy (S12-02b) — falls back to the default feed copy for the "all" chip. */
export function emptyCopyForChip(chip: FeedChip | undefined): { title: string; message: string } {
  if (!chip) {
    return DEFAULT_EMPTY_COPY;
  }
  switch (chip.kind) {
    case 'space':
      return { title: `Nothing in ${chip.label} yet`, message: 'Start the first post.' };
    case 'horses':
      return {
        title: 'Nothing from your horses yet',
        message: 'Follow a horse to see its space here.',
      };
    case 'polls':
      return { title: 'No polls right now', message: '' };
    case 'news':
    case 'charity':
      return { title: 'No stories yet', message: '' };
    default:
      return DEFAULT_EMPTY_COPY;
  }
}

export function CommunityFeedView({
  member,
  items,
  contentState,
  isLoading,
  isRefetching,
  onRefresh,
  onOpenPost,
  onOpenProfile,
  onToggleLike,
  pendingLikePostId,
  onVote,
  pendingVotePollIds,
  onOpenStory,
  chips = [],
  selectedChipId = 'all',
  onSelectChip = () => {},
  emptyCopy = DEFAULT_EMPTY_COPY,
}: CommunityFeedViewProps) {
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();
  const displayName = member.name?.trim() || 'Rionna member';

  return (
    <ScrollView
      className="flex-1 bg-neutral-100"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: contentPaddingTop,
        paddingBottom: contentPaddingBottom,
      }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      <View className="mb-8 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-mono text-[10px] tracking-widest text-violet-700 uppercase">
            Members feed
          </Text>
          <Text className="mt-2 font-sans text-3xl font-semibold text-neutral-950">
            Community
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={onOpenProfile}
          className="size-11 items-center justify-center rounded-full border border-neutral-400 bg-white"
        >
          <Text className="font-sans text-base font-semibold text-neutral-950">
            {displayName.slice(0, 1).toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <FeedChipRow chips={chips} selectedId={selectedChipId} onSelect={onSelectChip} />

      {contentState === 'saved'
        ? (
            <View className="mb-4 rounded-xl border border-violet-300 bg-violet-50 px-4 py-3">
              <Text className="font-sans text-sm font-medium text-violet-900">
                Showing saved content
              </Text>
            </View>
          )
        : null}

      <View className="gap-4">
        {isLoading && !items
          ? (
              <View testID="member-feed-loading" className="items-center py-16">
                <ActivityIndicator color="#6D28D9" />
                <Text className="mt-3 font-sans text-sm text-neutral-600">Loading your feed…</Text>
              </View>
            )
          : null}
        {!isLoading && contentState === 'empty'
          ? (
              <EmptyState
                testID="member-feed-empty"
                title={emptyCopy.title}
                message={emptyCopy.message}
              />
            )
          : null}
        {!isLoading && contentState === 'unavailable'
          ? (
              <EmptyState
                testID="member-feed-unavailable"
                title="Feed unavailable"
                message="Check your connection and pull down to try again."
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
            onOpenStory={onOpenStory}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SignedInCommunityFeed({ member }: { member: AuthUser }) {
  const router = useRouter();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: member.id }),
    [member.id],
  );
  const chipsQuery = useFeedChips(scope);
  const chips = chipsQuery.isError ? [] : (chipsQuery.data?.chips ?? []);
  const chipSelection = useFeedChipSelection(scope, chips);
  const filter = chipSelection.selectedChip ? chipToFilter(chipSelection.selectedChip) : undefined;
  const feed = useMemberFeed(scope, filter);
  const like = usePostLike(scope);
  const poll = usePollVote(scope);

  return (
    <View className="flex-1">
      <CommunityFeedView
        member={member}
        items={feed.data}
        contentState={feed.contentState}
        isLoading={feed.isLoading}
        isRefetching={feed.isRefetching}
        onRefresh={() => void feed.refetch()}
        onOpenPost={(spaceId, postId) => router.push(
          `/post/${encodeURIComponent(spaceId)}/${encodeURIComponent(postId)}`,
        )}
        onOpenProfile={() => router.push('/profile')}
        onToggleLike={(postId, liked) => like.toggleLike({ postId, liked })}
        pendingLikePostId={like.pendingPostId}
        onVote={(pollId, optionId) => poll.vote({ pollId, optionId })}
        pendingVotePollIds={poll.pendingPollIds}
        onOpenStory={slug => router.push(`/news/${encodeURIComponent(slug)}`)}
        chips={chips}
        selectedChipId={chipSelection.selectedId}
        onSelectChip={chipSelection.select}
        emptyCopy={emptyCopyForChip(chipSelection.selectedChip)}
      />
      <NewPostButton scope={scope} />
    </View>
  );
}

export function CommunityFeedScreen() {
  const member = useAuthStore.use.user();
  return member ? <SignedInCommunityFeed member={member} /> : null;
}
