import { FlashList } from '@shopify/flash-list';
import React from 'react';

import type { Post } from '@/api';
import { usePosts } from '@/api';
import { EmptyList, SafeAreaView, Text, View } from '@/ui';

import { Card } from './card';

export const Feed = () => {
  const { data, isLoading } = usePosts();

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <Card {...item} />,
    []
  );
  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyList isLoading={isLoading} />}
        estimatedItemSize={300}
      />
    </View>
  );
};

const ListHeader = () => (
  <SafeAreaView className="ml-4">
    <Text variant="lg" className="font-bold">
      Feed
    </Text>
  </SafeAreaView>
);
