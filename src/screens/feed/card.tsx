import React from 'react';

import type { Post } from '@/api';
import { Image, Pressable, Text, View } from '@/ui';

type Props = Post & { onPress?: () => void };

export const Card = ({ title, body, onPress = () => {} }: Props) => {
  return (
    <Pressable
      className="overflow-hidden p-2 m-2 block  bg-neutral-200  "
      onPress={onPress}
    >
      <Image
        className="object-cover h-56 w-full "
        source={{
          uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        }}
      />

      <View>
        <Text variant="md" numberOfLines={1} className="font-bold">
          {title}
        </Text>
        <Text variant="xs" numberOfLines={3}>
          {body}
        </Text>
      </View>
    </Pressable>
  );
};
