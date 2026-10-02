import type { InboxItem } from '@/features/notification-centre/types';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Image, MonoLabel, Text } from '@/components/ui';
import { tagSpecForKind } from '@/features/notification-centre/lib/kind-tag';
import { relativeTime } from '@/features/pulse/components/relative-time';

type InboxRowProps = {
  item: InboxItem;
  onPress: (item: InboxItem) => void;
};

/**
 * Notification card (frame 17): white r8, category tag + title + time on the
 * left, a 96pt full-height image on the right when `imageUrl` is present.
 * Unread = SemiBold title + lilac dot. `actorAvatarUrl` is not used here.
 */
export function InboxRow({ item, onPress }: InboxRowProps) {
  const spec = tagSpecForKind(item.kind);
  return (
    <Pressable
      testID={`inbox-row-${item.id}`}
      accessibilityRole="button"
      accessibilityHint={item.unread ? 'Unread' : undefined}
      onPress={() => onPress(item)}
      className="flex-row overflow-hidden rounded-lg bg-white"
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
    >
      <View className="flex-1 items-start gap-2 p-4">
        <View className={`rounded-sm px-2.5 py-1.5 ${spec.boxClass}`}>
          <MonoLabel testID={`inbox-tag-${item.id}`}>{spec.label}</MonoLabel>
        </View>
        <View className="flex-row items-start gap-2">
          <Text
            variant="body-lg"
            numberOfLines={3}
            className={item.unread ? 'flex-1 font-sans-semibold' : 'flex-1'}
          >
            {item.title}
          </Text>
          {item.unread
            ? <View testID="inbox-unread-dot" className="mt-1.5 size-2 rounded-full bg-primary-fixed" />
            : null}
        </View>
        <Text variant="body-sm" className="text-ink-muted">
          {relativeTime(item.updatedAt)}
        </Text>
      </View>
      {item.imageUrl
        ? (
            <Image
              testID={`inbox-image-${item.id}`}
              source={{ uri: item.imageUrl }}
              className="w-24 self-stretch"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          )
        : null}
    </Pressable>
  );
}
