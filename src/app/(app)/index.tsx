import { type LegendListRenderItemProps } from '@legendapp/list';
import React from 'react';

import type { Post } from '@/api';
import { usePosts } from '@/api';
import { Card } from '@/components/card';
import {
  EmptyList,
  FocusAwareStatusBar,
  List,
  Text,
  View,
} from '@/components/ui';

export default function Feed() {
  const { data, isPending, isError } = usePosts();
  const renderItem = React.useCallback(
    ({ item }: LegendListRenderItemProps<Post>) => <Card {...item} />,
    []
  );

  if (isError) {
    return (
      <View>
        <Text> Error Loading data </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <List
        data={data || []}
        renderItem={renderItem}
        keyExtractor={(item: Post, index: number) =>
          item.id?.toString() || `item-${index}`
        }
        ListEmptyComponent={<EmptyList isLoading={isPending} />}
        estimatedItemSize={300}
        recycleItems
        maintainVisibleContentPosition
      />
    </View>
  );
}
