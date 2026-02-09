import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { LessonNavigator } from '@/features/shop/components/LessonNavigator';
import { useCourseContent, useCourseList } from '@/features/shop/api';

export default function CourseDetailScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { courses, isLoading, error } = useCourseList(courseId ?? null);
  const course = courses[0];
  const courseKey = course?.code ?? course?.slug ?? courseId ?? '';
  const {
    data: courseContentTree,
    firstLessonSlug,
    isLoading: isContentLoading,
  } = useCourseContent(courseKey || null);

  if (error || (!isLoading && !course)) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-red-600 dark:text-red-400">
          Không tìm thấy khóa học.
        </Text>
      </View>
    );
  }

  if (isLoading || !course) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-neutral-500">Đang tải...</Text>
      </View>
    );
  }

  const courseName = course.title_vi ?? course.title;

  const handleVaoHoc = () => {
    if (firstLessonSlug) router.push(`/shop/lesson/${firstLessonSlug}`);
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator
      >
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {courseName}
        </Text>
        {course.code ? (
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {course.code}
          </Text>
        ) : null}
        <View className="mt-6">
          <Button
            label="Vào học"
            onPress={handleVaoHoc}
            disabled={!firstLessonSlug || isContentLoading}
            loading={isContentLoading}
          />
        </View>
        <LessonNavigator tree={courseContentTree} />
      </ScrollView>
    </>
  );
}
