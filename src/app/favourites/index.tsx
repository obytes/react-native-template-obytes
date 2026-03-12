import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function FavouritesScreen() {
  return (
    <View className="flex-1 p-4">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Yêu thích</Text>
      <Text className="mt-2 text-gray-500">
        Danh sách món ăn yêu thích của bạn
      </Text>
    </View>
  );
}
