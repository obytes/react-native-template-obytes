import { Text, View } from 'react-native';

import type { LessonFlashcardSet } from '@/features/lesson/api';

type Props = { sets: LessonFlashcardSet[] };

export function VocabSetList({ sets }: Props) {
  if (sets.length === 0) {
    return (
      <View className="py-6">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có bộ từ vựng nào.
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-3 pb-6">
      {sets.map((s) => (
        <View
          key={s.key}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
        >
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {s.title}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {s.cardCount} từ vựng
          </Text>
        </View>
      ))}
    </View>
  );
}
