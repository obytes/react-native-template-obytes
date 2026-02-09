import { Stack } from 'expo-router';

export default function ShopLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Shop' }} />
      <Stack.Screen name="[courseId]" options={{ title: 'Khóa học' }} />
      <Stack.Screen name="lesson" options={{ title: 'Bài học' }} />
    </Stack>
  );
}
