import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function NotificationsScreen() {
  return (
    <View className="flex-1 p-4">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Thông báo</Text>
      <Text className="mt-2 text-gray-500">
        Các thông báo mới nhất của bạn
      </Text>
    </View>
  );
}
