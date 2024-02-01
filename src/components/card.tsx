import { Link } from 'expo-router';
import React from 'react';

import type { Post } from '@/api';
import { Image, Pressable, Text, View } from '@/ui';

type Props = Post;

export const Card = ({ title, body, id }: Props) => {
  return (
    <Link href={`/feed/${id}`} asChild>
      <Pressable className="m-2 overflow-hidden rounded-xl  bg-neutral-200 p-2 shadow-xl dark:bg-charcoal-900">
        <Image
          className="h-56 w-full"
          contentFit="cover"
          source={{
            uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
          }}
        />

        <View>
          <Text className="py-2 text-2xl font-bold">{title}</Text>
          <Text numberOfLines={3} className="leading-snug">
            {body}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};
