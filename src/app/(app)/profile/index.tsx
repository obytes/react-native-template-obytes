import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Profile</Text>
      <Text className="mt-2 text-gray-500">Thông tin cá nhân</Text>
    </View>
  );
}
