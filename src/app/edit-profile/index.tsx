import React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function EditProfileScreen() {
  return (
    <View className="flex-1 p-4">
      <FocusAwareStatusBar />
      <Text className="text-2xl font-bold">Chỉnh sửa hồ sơ</Text>
      <Text className="mt-2 text-gray-500">
        Cập nhật thông tin cá nhân của bạn
      </Text>
    </View>
  );
}
