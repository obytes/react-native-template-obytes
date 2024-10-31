import { FlashList } from '@shopify/flash-list';
import React from 'react';

import { type Cart } from '@/api/carts/types';
import { useCarts } from '@/api/carts/use-carts';
import CartItem from '@/components/cart-item/cart-item';
import { ActivityIndicator, FocusAwareStatusBar, Text, View } from '@/ui';

export default function Carts() {
  const { data, isLoading } = useCarts({ limit: 10, offset: 0 });

  return (
    <View className="flex-1">
      <FocusAwareStatusBar />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlashList<Cart>
          data={data?.pages.flatMap((page) => page.data.carts)}
          renderItem={({ item }) => <CartItem cart={item} />}
          ListEmptyComponent={<Text>No carts</Text>}
          estimatedItemSize={30}
          keyExtractor={(_, index) => `item-${index}`}
        />
      )}
    </View>
  );
}
