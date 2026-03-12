import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function DiscoverScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Discover</Text>
      <Text className="mt-2 text-gray-500">Khám phá công thức mới</Text>
    </View>
  );
}
