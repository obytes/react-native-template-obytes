import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React from 'react';

import type { Post } from '@/api';
import { usePosts } from '@/api';
import { EmptyList, View } from '@/ui';

import { Card } from './card';

export const Feed = () => {
  const { data, isLoading } = usePosts();
  const { navigate } = useNavigation();

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => (
      <Card {...item} onPress={() => navigate('Post', { id: item.id })} />
    ),
    [navigate]
  );
  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListEmptyComponent={<EmptyList isLoading={isLoading} />}
        estimatedItemSize={300}
      />
    </View>
  );
};
