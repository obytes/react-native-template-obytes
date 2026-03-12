import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function SearchScreen() {
  return (
    <View className="flex-1 p-4">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Tìm kiếm</Text>
      <Text className="mt-2 text-gray-500">
        Tìm kiếm công thức, nguyên liệu, hoặc bữa ăn
      </Text>
    </View>
  );
}
