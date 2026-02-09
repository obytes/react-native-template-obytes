import { Text, View } from 'react-native';

import type { LessonGrammar } from '@/features/lesson/api';

type Props = { grammars: LessonGrammar[] };

export function GrammarList({ grammars }: Props) {
  if (grammars.length === 0) {
    return (
      <View className="py-6">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có nội dung ngữ pháp.
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-3 pb-6">
      {grammars.map((g) => (
        <View
          key={g.id ?? g.slug ?? g.title}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
        >
          {g.title ? (
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {g.title}
            </Text>
          ) : null}
          {(g.summary_vi ?? g.summary) ? (
            <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              {g.summary_vi ?? g.summary}
            </Text>
          ) : null}
          {g.formula ? (
            <Text className="mt-2 font-mono text-sm text-primary-600 dark:text-primary-400">
              {g.formula}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
