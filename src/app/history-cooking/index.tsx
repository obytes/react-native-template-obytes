import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function HistoryCookingScreen() {
  return (
    <View className="flex-1 p-4">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Lịch sử nấu ăn</Text>
      <Text className="mt-2 text-gray-500">
        Chi tiết lịch sử nấu ăn của bạn
      </Text>
    </View>
  );
}
