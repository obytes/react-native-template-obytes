import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { usePost } from '@/api';
import { ActivityIndicator, FocusAwareStatusBar, Text, View } from '@/ui';

export default function Post() {
  const local = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError } = usePost({
    //@ts-ignore
    variables: { id: local.id },
  });

  if (isLoading) {
    return (
      <View className="flex-1  justify-center">
        <Stack.Screen options={{ title: 'Post' }} />
        <FocusAwareStatusBar />
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1  justify-center">
        <Stack.Screen options={{ title: 'Post' }} />
        <FocusAwareStatusBar />
        <Text variant="md" className="text-center">
          Error loading post
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 ">
      <Stack.Screen options={{ title: 'Post' }} />
      <FocusAwareStatusBar />
      <Text variant="h2">{data.title}</Text>
      <Text variant="md">{data.body} </Text>
    </View>
  );
}
