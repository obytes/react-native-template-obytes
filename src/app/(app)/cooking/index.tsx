import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function CookbookScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Cooking page</Text>
      <Text className="mt-2 text-gray-500">Nấu ăn ngay thôi, siuuu</Text>
    </View>
  );
}
