import { useRouter } from 'expo-router';
import React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return (
    <View className="flex h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1 items-center justify-center bg-orange-50">
        <Text className="text-6xl">🍳</Text>
      </View>
      <View className="justify-end px-4">
        <Text className="my-3 text-center text-5xl font-bold">
          Smart Food
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          Khám phá công thức nấu ăn ngon mỗi ngày
        </Text>

        <Text className="my-1 pt-6 text-left text-lg">
          🍕 Công thức đa dạng
        </Text>
        <Text className="my-1 text-left text-lg">
          📖 Sách nấu ăn cá nhân
        </Text>
        <Text className="my-1 text-left text-lg">
          🔍 Tìm kiếm nhanh chóng
        </Text>
        <Text className="my-1 text-left text-lg">
          ❤️ Lưu món yêu thích
        </Text>
      </View>
      <SafeAreaView className="mt-6">
        <Button
          label="Bắt đầu nào!"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
        />
      </SafeAreaView>
    </View>
  );
}
