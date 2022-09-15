import React from 'react';

import { Image, Pressable, Text, View } from '@/ui';

type Props = {
  onPress?: () => void;
  image: string;
  title: string;
  description: string;
};

export const Card = ({
  title,
  description,
  image = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  onPress,
}: Props) => {
  return (
    <Pressable
      className="my-1 block overflow-hidden rounded-2xl"
      onPress={onPress}
    >
      <Image
        className="h-56 w-full object-cover"
        source={{
          uri: image,
        }}
      />

      <View className="bg-gray-900 p-4">
        <Text className="text-xs text-gray-500">website.com</Text>
        <Text className="text-sm text-white">{title}</Text>
        <Text className="mt-1 text-xs text-gray-500">{description}</Text>
      </View>
    </Pressable>
  );
};
