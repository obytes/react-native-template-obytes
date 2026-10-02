import type { AuthorRole } from '@/features/member-content/types';

import * as React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Avatar, MonoLabel, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Heart } from '@/components/ui/icons';
import { ChatV2 } from '@/components/ui/icons/v2';
import { SPACE_TAG_CLASS, spaceTagTone } from '@/features/member-content/lib/space-tag';

const ROLE_LABEL: Record<AuthorRole, string> = { trainer: 'Trainer', staff: 'Staff' };

/** Coloured space tag: Racing = sage, New to racing = ice, others = cream. */
export function SpaceTag({ name }: { name: string | null | undefined }) {
  const label = name?.trim();
  if (!label) {
    return null;
  }
  return (
    <View
      testID="space-tag"
      className={twMerge('shrink rounded-[5px] px-2.5 py-1.5', SPACE_TAG_CLASS[spaceTagTone(label)])}
    >
      <MonoLabel className="text-label" numberOfLines={1}>{label}</MonoLabel>
    </View>
  );
}

/** Lilac-tint role badge. Renders only when the backend supplies `authorRole` (S13-11). */
export function RoleBadge({ role }: { role: AuthorRole | null | undefined }) {
  if (!role) {
    return null;
  }
  return (
    <View testID="role-badge" className="rounded-[5px] bg-white px-2.5 py-1.5">
      <MonoLabel>{ROLE_LABEL[role]}</MonoLabel>
    </View>
  );
}

export function AuthorHeader({
  name,
  avatarUrl,
  time,
  spaceName,
  role,
  showSpaceTag = true,
}: {
  name: string | null;
  avatarUrl?: string | null;
  time: string | null;
  spaceName?: string | null;
  role?: AuthorRole | null;
  showSpaceTag?: boolean;
}) {
  const displayName = name?.trim() || 'Rionna member';
  return (
    <View className="flex-row items-center gap-2">
      <Avatar uri={avatarUrl} name={displayName} size={41} ring />
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text variant="title" numberOfLines={1} className="shrink">{displayName}</Text>
          {showSpaceTag ? <SpaceTag name={spaceName} /> : null}
          <RoleBadge role={role} />
        </View>
        {time ? <Text variant="body-sm" className="text-label opacity-60">{time}</Text> : null}
      </View>
    </View>
  );
}

/** Heart (filled plum when liked) + comment count row. */
export function ActivityRow({
  likeCount,
  commentCount,
  isLiked,
  onToggleLike,
  likePending = false,
  likeKey,
}: {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onToggleLike?: () => void;
  likePending?: boolean;
  likeKey?: string;
}) {
  const heartColor = isLiked ? colors.plum : colors.label;
  const like = (
    <>
      <Heart width={20} height={20} filled={isLiked} color={heartColor} />
      <Text variant="body" className={isLiked ? 'text-plum' : 'text-label'}>{likeCount}</Text>
    </>
  );
  return (
    <View className="flex-row items-center gap-4">
      {onToggleLike
        ? (
            <Pressable
              testID={likeKey}
              accessibilityRole="button"
              accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
              accessibilityState={{ selected: isLiked, disabled: likePending }}
              disabled={likePending}
              hitSlop={8}
              onPress={onToggleLike}
              className="flex-row items-center gap-0.5"
            >
              {like}
            </Pressable>
          )
        : (
            <View
              accessible
              accessibilityLabel={`${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
              className="flex-row items-center gap-0.5"
            >
              {like}
            </View>
          )}
      <View
        accessible
        accessibilityLabel={`${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`}
        className="flex-row items-center gap-0.5"
      >
        <ChatV2 size={20} color={colors.label} strokeWidth={1.2} />
        <Text variant="body" className="text-label">{commentCount}</Text>
      </View>
    </View>
  );
}
