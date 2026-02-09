import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { FocusAwareStatusBar } from '@/components/ui';
import {
  useLessonDetail,
  useLessonFlashcardSets,
  useLessonGrammars,
  type LessonFlashcardSet,
  type LessonGrammar,
} from '@/features/lesson/api';
import { getLessonPrimaryType } from '@/features/lesson/utils';

function GrammarList({ grammars }: { grammars: LessonGrammar[] }) {
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

function VocabSetList({ sets }: { sets: LessonFlashcardSet[] }) {
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

export default function LessonDetailScreen() {
  const { lessonSlug } = useLocalSearchParams<{ lessonSlug: string }>();
  const slug = (lessonSlug ?? '').trim();
  const { lesson, isLoading, error } = useLessonDetail(slug || null);
  const primaryType = getLessonPrimaryType(lesson?.type);
  const { grammars, isLoading: grammarsLoading } = useLessonGrammars(
    primaryType === 'grammar' ? slug : null,
  );
  const { sets: vocabSets, isLoading: vocabLoading } = useLessonFlashcardSets(
    primaryType === 'vocab' ? slug : null,
  );

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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator
      >
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </Text>
        {lesson.code ? (
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {lesson.code}
          </Text>
        ) : null}

        <View className="mt-6">
          {primaryType === 'grammar' ? (
            grammarsLoading ? (
              <Text className="text-neutral-500">Đang tải ngữ pháp...</Text>
            ) : (
              <GrammarList grammars={grammars} />
            )
          ) : primaryType === 'vocab' ? (
            vocabLoading ? (
              <Text className="text-neutral-500">Đang tải từ vựng...</Text>
            ) : (
              <VocabSetList sets={vocabSets} />
            )
          ) : (
            <Text className="text-neutral-500 dark:text-neutral-400">
              Nội dung bài học đang được cập nhật.
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
