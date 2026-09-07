import type { MemberFeedItem } from '@/features/member-content/types';

import { MemberFeedCard } from '@/features/member-content/components/member-feed-card';
import { PollCard } from '@/features/polls/components/poll-card';

type FeedItemRendererProps = {
  item: MemberFeedItem;
  onOpen: (spaceId: string, postId: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  likePending?: boolean;
  onVote: (pollId: string, optionId: string) => void;
  votePending: boolean;
  onOpenStory: (slug: string) => void;
};

export function FeedItemRenderer({
  item,
  onOpen,
  onToggleLike,
  likePending,
  onVote,
  votePending,
  onOpenStory,
}: FeedItemRendererProps) {
  if (item.kind === 'poll' && item.poll) {
    return <PollCard poll={item.poll} onVote={onVote} pending={votePending} variant="card" />;
  }

  if (item.kind === 'story' && item.story) {
    // Stories carry spaceId: null; MemberFeedCard only wires its Pressable
    // when spaceId is set, so we stand in a non-empty placeholder here — the
    // real navigation target is item.story.slug via onOpenStory below.
    // onToggleLike/likePending are deliberately omitted: no like affordance
    // exists for merged news/charity stories (MemberFeedCard falls back to
    // a read-only like count when no onToggleLike is wired).
    return (
      <MemberFeedCard
        item={{ ...item, spaceId: item.spaceId ?? item.id }}
        onOpen={() => onOpenStory(item.story!.slug)}
      />
    );
  }

  // A `kind:'poll'` item without a `poll` payload deliberately falls back to
  // MemberFeedCard (defensive; should not happen with a valid cache/backend).
  return (
    <MemberFeedCard
      item={item}
      onOpen={onOpen}
      onToggleLike={onToggleLike}
      likePending={likePending}
    />
  );
}
