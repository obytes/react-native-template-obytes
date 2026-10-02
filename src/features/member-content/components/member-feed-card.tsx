import type { MemberFeedItem } from '@/features/member-content/types';

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Image } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Heart } from '@/components/ui/icons';
import { formatCount, formatMemberContentDate } from '@/features/member-content/lib/content-format';

type MemberFeedCardProps = {
  item: MemberFeedItem;
  onOpen: (spaceId: string, postId: string) => void;
  /** Wire to flip the like; omitted → read-only count (e.g. legacy surfaces). */
  onToggleLike?: (postId: string, liked: boolean) => void;
  /** Disables the heart while this post's like mutation is in flight. */
  likePending?: boolean;
};

type LikeControlProps = {
  item: MemberFeedItem;
  onToggleLike?: (postId: string, liked: boolean) => void;
  likePending?: boolean;
};

function LikeControl({ item, onToggleLike, likePending = false }: LikeControlProps) {
  const countLabel = formatCount(item.likeCount, 'like', 'likes');
  if (!onToggleLike) {
    return <Text className="font-sans text-xs text-ink-muted">{countLabel}</Text>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.isLiked ? 'Unlike post' : 'Like post'}
      disabled={likePending}
      hitSlop={8}
      onPress={() => onToggleLike(item.id, !item.isLiked)}
      className="flex-row items-center gap-1.5"
    >
      <Heart
        width={16}
        height={16}
        filled={item.isLiked}
        color={item.isLiked ? colors.danger[700] : colors.inkMuted}
      />
      <Text
        className={
          item.isLiked
            ? 'font-sans-medium text-xs text-danger-700'
            : 'font-sans text-xs text-ink-muted'
        }
      >
        {countLabel}
      </Text>
    </Pressable>
  );
}

function CardBody({ item, onToggleLike, likePending }: LikeControlProps) {
  const date = formatMemberContentDate(item.createdAt);
  const meta = [item.spaceName, date].filter(Boolean).join(' · ');

  return (
    <View className="overflow-hidden rounded-2xl border border-outline-variant bg-white">
      {item.imageUrl
        ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="aspect-video w-full bg-secondary-container"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={item.title}
            />
          )
        : null}
      <View className="gap-3 p-5">
        {meta
          ? (
              <Text className="font-mono text-[10px] tracking-wider text-ink-muted uppercase">
                {meta}
              </Text>
            )
          : null}
        <Text className="font-sans-semibold text-xl text-ink">
          {item.title}
        </Text>
        {item.excerpt
          ? (
              <Text className="font-sans text-sm/5 text-ink-variant" numberOfLines={3}>
                {item.excerpt}
              </Text>
            )
          : null}
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
          {item.authorName
            ? <Text className="font-sans text-xs text-ink-variant">{item.authorName}</Text>
            : null}
          <LikeControl item={item} onToggleLike={onToggleLike} likePending={likePending} />
          <Text className="font-sans text-xs text-ink-muted">
            {formatCount(item.commentCount, 'comment', 'comments')}
          </Text>
        </View>
      </View>
    </View>
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
