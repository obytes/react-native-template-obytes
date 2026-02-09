import { Text, View } from 'react-native';

export function LessonContentPlaceholder() {
  return (
    <View className="py-2">
      <Text className="text-neutral-500 dark:text-neutral-400">
        Nội dung bài học đang được cập nhật.
      </Text>
    </View>
  );
}
