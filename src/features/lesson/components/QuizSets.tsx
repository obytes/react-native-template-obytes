import * as React from 'react';
import { Text, View } from 'react-native';

import type { QuizQuestionSet } from '@/features/lesson/api';
import { useLessonQuestions } from '@/features/lesson/api';
import { QuestionRenderer } from './questions';

type Props = { lessonSlug: string };

export function QuizSets({ lessonSlug }: Props) {
  const { sets, isLoading, error } = useLessonQuestions(lessonSlug);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const onSelect = React.useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      if (prev[questionId] != null) return prev;
      return { ...prev, [questionId]: optionId };
    });
  }, []);

  if (error) {
    return (
      <View className="py-6">
        <Text className="text-center text-red-600 dark:text-red-400">
          Không tải được câu hỏi.
        </Text>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View className="py-6">
        <Text className="text-center text-neutral-500">Đang tải câu hỏi...</Text>
      </View>
    );
  }
  if (!sets.length) {
    return (
      <View className="py-6">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có bộ câu hỏi nào.
        </Text>
      </View>
    );
  }

  return (
    <View className="pb-6">
      {sets.map((set) => (
        <QuizSetBlock
          key={set.setKey}
          set={set}
          answers={answers}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

function QuizSetBlock({
  set,
  answers,
  onSelect,
}: {
  set: QuizQuestionSet;
  answers: Record<string, string>;
  onSelect: (questionId: string, optionId: string) => void;
}) {
  const questions = set.questions ?? [];
  if (questions.length === 0) return null;

  return (
    <View className="mb-6">
      {set.title ? (
        <Text className="mb-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
          {set.title}
        </Text>
      ) : null}
      <View className="gap-6">
        {questions.map((q, idx) => (
          <View
            key={q.id ?? idx}
            className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <QuestionRenderer
              question={q}
              selectedId={answers[q.id ?? '']}
              onSelect={(optionId) => onSelect(q.id ?? String(idx), optionId)}
              questionNumber={idx + 1}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
