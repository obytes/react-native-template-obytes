import { useLocalSearchParams } from 'expo-router';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useLessonDetail } from '@/features/lesson/api';

export default function LessonDetailScreen() {
  const { lessonSlug } = useLocalSearchParams<{ lessonSlug: string }>();
  const { lesson, isLoading, error } = useLessonDetail(lessonSlug ?? null);

  if (error || (!isLoading && !lesson)) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-red-600 dark:text-red-400">
          Không tìm thấy bài học.
        </Text>
      </View>
    );
  }
  if (isLoading || !lesson) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-neutral-500">Đang tải...</Text>
      </View>
    );
  }

  const title = lesson.title ?? lesson.slug ?? 'Bài học';
  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 px-4 pt-6">
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </Text>
        {lesson.code ? (
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {lesson.code}
          </Text>
        ) : null}
        <View className="mt-6">
          <Text className="text-neutral-500 dark:text-neutral-400">
            Nội dung bài học đang được cập nhật.
          </Text>
        </View>
      </View>
    </>
  );
}
