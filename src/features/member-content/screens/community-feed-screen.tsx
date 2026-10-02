import type { FeaturedCardData } from '@/features/member-content/components/featured-card';
import type { FeedChip, MemberContentState, MemberFeedItem } from '@/features/member-content/types';
import type { AuthUser } from '@/lib/auth/utils';

import Env from 'env';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityIndicator, EmptyState, ErrorState, Gradient, Text } from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { NewPostButton } from '@/features/community-posting/components/new-post-button';
import { useFeedChips } from '@/features/member-content/api/use-feed-chips';
import { useMemberFeed } from '@/features/member-content/api/use-member-feed';
import { usePostLike } from '@/features/member-content/api/use-post-like';
import { AnnouncementCarousel } from '@/features/member-content/components/announcement-carousel';
import { FeaturedCard } from '@/features/member-content/components/featured-card';
import { FeedChipRow } from '@/features/member-content/components/feed-chip-row';
import { FeedItemRenderer } from '@/features/member-content/components/feed-item-renderer';
import { announcementSpaceIdsFromChips, selectAnnouncements } from '@/features/member-content/lib/announcements';
import { chipToFilter } from '@/features/member-content/lib/chip-filter';
import { useFeedChipSelection } from '@/features/member-content/lib/use-feed-chip-selection';
import { usePollVote } from '@/features/polls/api/use-poll-vote';

type CommunityFeedViewProps = {
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
  onOpenStory: (slug: string) => void;
  chips?: FeedChip[];
  selectedChipId?: string;
  onSelectChip?: (id: string) => void;
  emptyCopy?: { title: string; message: string };
  /** Top-right action (the "+" new-post button). */
  headerRight?: React.ReactNode;
  /** Live Q&A slot — S13-11 supplies this; nothing renders without it. */
  featuredCard?: FeaturedCardData | null;
  onOpenFeaturedCard?: (id: string) => void;
};

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
  onOpenStory,
  chips = [],
  selectedChipId = 'all',
  onSelectChip = () => {},
  emptyCopy = DEFAULT_EMPTY_COPY,
  headerRight,
  featuredCard,
  onOpenFeaturedCard,
}: CommunityFeedViewProps) {
  const contentPaddingBottom = useTabBarContentPadding(24);
  const contentPaddingTop = useScreenTopPadding();
  const announcements = React.useMemo(
    () => selectAnnouncements(items, announcementSpaceIdsFromChips(chips)),
    [items, chips],
  );

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      {/* The gradient covers the header + featured area only; posts sit on plain surface. */}
      <View className="gap-4 pb-6" style={{ paddingTop: contentPaddingTop }}>
        <Gradient variant="page" pointerEvents="none" style={StyleSheet.absoluteFill} />
        <View className="flex-row items-center justify-between px-4">
          <Text variant="display-lg" accessibilityRole="header">Community</Text>
          {headerRight}
        </View>
        <FeedChipRow chips={chips} selectedId={selectedChipId} onSelect={onSelectChip} contentInset={16} />
        <AnnouncementCarousel announcements={announcements} onOpen={onOpenPost} />
        {featuredCard
          ? (
              <View className="px-4">
                <FeaturedCard card={featuredCard} onPress={onOpenFeaturedCard} />
              </View>
            )
          : null}
      </View>

      <View className="gap-3 px-4">
        {contentState === 'saved'
          ? (
              <View className="rounded-lg bg-primary-fixed px-4 py-3">
                <Text variant="body-sm" className="font-sans-medium">Showing saved content</Text>
              </View>
            )
          : null}
        {isLoading && !items
          ? (
              <View testID="member-feed-loading" className="items-center py-16">
                <ActivityIndicator />
                <Text variant="body" className="mt-3 text-ink-variant">Loading your feed…</Text>
              </View>
            )
          : null}
        {!isLoading && contentState === 'empty'
          ? <EmptyState testID="member-feed-empty" title={emptyCopy.title} body={emptyCopy.message || undefined} />
          : null}
        {!isLoading && contentState === 'unavailable'
          ? (
              <ErrorState
                testID="member-feed-unavailable"
                title="Feed unavailable"
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
  const chips = chipsQuery.data?.chips ?? [];
  const chipSelection = useFeedChipSelection(scope, chips);
  const filter = chipSelection.selectedChip ? chipToFilter(chipSelection.selectedChip) : undefined;
  const feed = useMemberFeed(scope, filter);
  const like = usePostLike(scope);
  const poll = usePollVote(scope);

  return (
    <View className="flex-1">
      <CommunityFeedView
        items={feed.data}
        contentState={feed.contentState}
        isLoading={feed.isLoading}
        isRefetching={feed.isRefetching}
        onRefresh={() => void feed.refetch()}
        onOpenPost={(spaceId, postId) => router.push(
          `/post/${encodeURIComponent(spaceId)}/${encodeURIComponent(postId)}`,
        )}
        onToggleLike={(postId, liked) => like.toggleLike({ postId, liked })}
        pendingLikePostId={like.pendingPostId}
        onVote={(pollId, optionId) => poll.vote({ pollId, optionId })}
        pendingVotePollIds={poll.pendingPollIds}
        onOpenStory={slug => router.push(`/news/${encodeURIComponent(slug)}`)}
        chips={chips}
        selectedChipId={chipSelection.selectedId}
        onSelectChip={chipSelection.select}
        emptyCopy={emptyCopyForChip(chipSelection.selectedChip)}
        headerRight={<NewPostButton scope={scope} />}
      />
    </View>
  );
}

export function CommunityFeedScreen() {
  const member = useAuthStore.use.user();
  return member ? <SignedInCommunityFeed member={member} /> : null;
}
