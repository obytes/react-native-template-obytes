import type { QuizQuestion } from '@/features/lesson/api';
import { Text, View } from 'react-native';
import { MCQQuestion } from './MCQQuestion';

type Props = {
  question: QuizQuestion;
  selectedId?: string;
  onSelect: (optionId: string, isCorrect: boolean) => void;
  questionNumber?: number;
};

export function QuestionRenderer({
  question,
  selectedId,
  onSelect,
  questionNumber,
}: Props) {
  const type = (question.questionType ?? '').toUpperCase();

  if (type === 'MCQ' || type === 'MCQ_BLANK' || type === 'MCQ_ERROR') {
    return (
      <MCQQuestion
        question={question}
        selectedId={selectedId}
        onSelect={onSelect}
        questionNumber={questionNumber}
      />
    );
  }

  return (
    <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        Loại câu hỏi chưa hỗ trợ: {question.questionType ?? 'N/A'}
      </Text>
    </View>
  );
}
