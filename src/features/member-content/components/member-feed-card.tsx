import type { MemberFeedItem } from '@/features/member-content/types';

import * as React from 'react';
import { Pressable } from 'react-native';

import { Card, Image, Text } from '@/components/ui';
import { ActivityRow, AuthorHeader } from '@/features/member-content/components/post-parts';
import { formatRelativeTime } from '@/features/member-content/lib/space-tag';

type MemberFeedCardProps = {
  item: MemberFeedItem;
  onOpen: (spaceId: string, postId: string) => void;
  /** Wire to flip the like; omitted → read-only count (e.g. legacy surfaces). */
  onToggleLike?: (postId: string, liked: boolean) => void;
  /** Disables the heart while this post's like mutation is in flight. */
  likePending?: boolean;
};

type CardBodyProps = Pick<MemberFeedCardProps, 'item' | 'onToggleLike' | 'likePending'>;

function CardBody({ item, onToggleLike, likePending }: CardBodyProps) {
  return (
    <Card className="gap-3 border border-outline-variant">
      <AuthorHeader
        name={item.authorName}
        avatarUrl={item.authorAvatarUrl}
        time={formatRelativeTime(item.createdAt)}
        spaceName={item.spaceName}
        spaceId={item.spaceId}
        role={item.authorRole}
      />
      {item.title ? <Text variant="title">{item.title}</Text> : null}
      {item.excerpt
        ? <Text variant="body-lg" className="text-ink-variant" numberOfLines={3}>{item.excerpt}</Text>
        : null}
      {item.imageUrl
        ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="aspect-video w-full rounded-md bg-secondary-container"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={item.title}
            />
          )
        : null}
      <ActivityRow
        likeCount={item.likeCount}
        commentCount={item.commentCount}
        isLiked={item.isLiked}
        likePending={likePending}
        onToggleLike={onToggleLike ? () => onToggleLike(item.id, !item.isLiked) : undefined}
      />
    </Card>
  );
}

export function MemberFeedCard({ item, onOpen, onToggleLike, likePending }: MemberFeedCardProps) {
  if (!item.spaceId) {
    return <CardBody item={item} onToggleLike={onToggleLike} likePending={likePending} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={() => onOpen(item.spaceId!, item.id)}
    >
      <CardBody item={item} onToggleLike={onToggleLike} likePending={likePending} />
    </Pressable>
  );
}
