import React from 'react';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';

export default function PrivacyScreen() {
  return (
    <ScrollView>
      <View className="flex-1 p-4">
        <FocusAwareStatusBar />
        <Text className="text-2xl font-bold">Chính sách bảo mật</Text>
        <Text className="mt-4 leading-6 text-gray-600">
          Chính sách bảo mật của Smart Food sẽ được cập nhật tại đây.
        </Text>
      </View>
    </ScrollView>
  );
}
