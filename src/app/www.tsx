import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '@/ui';

export default function WWW() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    if (title) {
      navigation.setOptions({
        title,
      });
    }
  }, [navigation, title]);

  if (!url || typeof url !== 'string') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-red-500">Invalid URL</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WebView
        source={{ uri: url }}
        className="flex-1"
        onError={() => router.back()}
      />
    </View>
  );
}
