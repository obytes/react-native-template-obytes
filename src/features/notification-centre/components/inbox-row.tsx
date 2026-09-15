import type { InboxItem } from '@/features/notification-centre/types';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Image, Text } from '@/components/ui';
import { relativeTime } from '@/features/pulse/components/relative-time';

type InboxRowProps = {
  item: InboxItem;
  onPress: (item: InboxItem) => void;
};

function LeadingVisual({ item }: { item: InboxItem }) {
  if (item.icon === 'horse' && item.imageUrl) {
    return (
      <Image
        source={{ uri: item.imageUrl }}
        className="size-11 rounded-full"
        contentFit="cover"
      />
    );
  }
  if (item.icon === 'actor' && item.actorAvatarUrl) {
    return (
      <Image
        source={{ uri: item.actorAvatarUrl }}
        className="size-11 rounded-full"
        contentFit="cover"
      />
    );
  }
  return (
    <View className="size-11 items-center justify-center rounded-full bg-[#391d3a]">
      <Text className="font-sans font-semibold text-[#fcf9f2]">R</Text>
    </View>
  );
}

export function InboxRow({ item, onPress }: InboxRowProps) {
  return (
    <Pressable
      testID={`inbox-row-${item.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      accessibilityHint={item.unread ? 'Unread' : undefined}
      onPress={() => onPress(item)}
      className={`flex-row gap-3 px-5 py-4 ${item.unread ? 'bg-violet-50' : 'bg-white'}`}
    >
      <LeadingVisual item={item} />
      <View className="flex-1">
        <Text numberOfLines={2} className="font-sans text-sm font-semibold text-ink">
          {item.title}
        </Text>
        {item.body
          ? (
              <Text numberOfLines={1} className="mt-0.5 font-sans text-sm text-neutral-600">
                {item.body}
              </Text>
            )
          : null}
        <Text className="mt-1 font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
          {relativeTime(item.updatedAt)}
        </Text>
      </View>
      {item.unread
        ? <View testID="inbox-unread-dot" className="size-2.5 self-center rounded-full bg-violet-700" />
        : null}
    </Pressable>
  );
}
