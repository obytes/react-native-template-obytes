import type { QuizQuestion } from '@/features/lesson/api';
import { Pressable, Text, View } from 'react-native';

type Props = {
  question: QuizQuestion;
  selectedId?: string;
  onSelect: (optionId: string, isCorrect: boolean) => void;
  questionNumber?: number;
};

export function MCQQuestion({ question, selectedId, onSelect, questionNumber }: Props) {
  const options = question.content?.options ?? [];
  const guideText =
    (question.content?.guide ?? question.content?.guideVi ?? '').trim();
  const correctIds =
    (question.answerSpec as { correct_options?: string[] } | undefined)?.correct_options ??
    options.filter((o) => o.isCorrect).map((o) => o.id).filter(Boolean);
  const canGrade = Array.isArray(correctIds) && correctIds.length > 0;
  const hasAnswered = canGrade && Boolean(selectedId);

  const questionText =
    question.content?.questionVi ?? question.content?.question ?? '';

  return (
    <View className="gap-3">
      {guideText ? (
        <View className="flex-row gap-2 rounded-lg bg-primary-100/50 p-2 dark:bg-primary-900/20">
          <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400">i</Text>
          <Text className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
            {guideText}
          </Text>
        </View>
      ) : null}

      <View>
        {questionNumber != null ? (
          <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {questionNumber}. {questionText}
          </Text>
        ) : (
          <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {questionText}
          </Text>
        )}
      </View>

      <View className="gap-2">
        {options.map((o) => {
          const optId = o.id ?? '';
          const isCorrect = canGrade ? correctIds.includes(optId) : false;
          const isSelected = selectedId === optId;
          const label = o.textVi ?? o.text ?? optId;

          let bgClass = 'bg-white border-neutral-200 dark:border-neutral-600';
          let textClass = 'text-neutral-900 dark:text-neutral-100';
          if (hasAnswered && isCorrect) {
            bgClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
            textClass = 'text-green-700 dark:text-green-300 font-medium';
          } else if (hasAnswered && isSelected && !isCorrect) {
            bgClass = 'border-red-400 bg-red-50 dark:bg-red-900/20';
            textClass = 'text-red-700 dark:text-red-300 font-medium';
          } else if (isSelected) {
            bgClass = 'border-primary-500 bg-primary-50 dark:bg-primary-900/30';
            textClass = 'text-primary-700 dark:text-primary-200';
          }

          return (
            <Pressable
              key={optId}
              onPress={() => onSelect(optId, canGrade ? isCorrect : false)}
              className={`rounded-2xl border px-4 py-3 active:opacity-80 ${bgClass}`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                  {optId}
                </Text>
                <Text className={`flex-1 text-sm ${textClass}`} numberOfLines={3}>
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
