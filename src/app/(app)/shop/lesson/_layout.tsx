import { Stack } from 'expo-router';

export default function LessonLayout() {
  return <Stack><Stack.Screen name="[lessonSlug]" options={{ title: 'Bài học' }} /></Stack>;
}
