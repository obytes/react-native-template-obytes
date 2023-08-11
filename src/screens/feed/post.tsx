import { useRoute } from '@react-navigation/native';
import * as React from 'react';

import { usePost } from '@/api';
import type { RouteProp } from '@/navigation/types';
import { ActivityIndicator, FocusAwareStatusBar, Text, View } from '@/ui';

export const Post = () => {
  const { params } = useRoute<RouteProp<'Post'>>();
  const { data, isLoading, isError } = usePost({
    variables: { id: params.id },
  });

  if (isLoading) {
    return (
      <View className="flex-1  justify-center">
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1  justify-center">
        <FocusAwareStatusBar />
        <Text variant="md" className="text-center">
          Error loading post
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <Text variant="h2">{data.title}</Text>
      <Text variant="md">{data.body} </Text>
    </View>
  );
};
