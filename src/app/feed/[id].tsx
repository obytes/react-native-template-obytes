import { Stack } from 'expo-router';

import { FocusAwareStatusBar, View } from '@/ui';

export default function Post() {
  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FocusAwareStatusBar />
    </View>
  );
}
