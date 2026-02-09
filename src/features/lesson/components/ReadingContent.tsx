import * as React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import type { QuizQuestion, QuizSubQuestion } from '@/features/lesson/api';

type TabId = 'passage' | 'questions' | 'vocab';

type Props = { question: QuizQuestion };

export function ReadingContent({ question }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabId>('passage');
  const blocks = question.content?.blocks ?? [];
  const subquestions = question.content?.subquestions ?? [];
  const supplementNorms = question.content?.supplementNorms ?? [];
  const contentTitle = (question.content?.title ?? '').trim();
  const imageUrl =
    question.content?.media?.find((m) => m?.type === 'image')?.url ??
    question.content?.media?.find((m) => m?.url)?.url;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'passage', label: 'Bài đọc' },
    { id: 'questions', label: 'Câu hỏi' },
    { id: 'vocab', label: 'Từ vựng' },
  ];

  return (
    <View className="flex-1">
      <View className="flex-row border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 border-b-2 py-2.5 ${
                isActive ? 'border-primary-500' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator
      >
        {activeTab === 'passage' && (
          <ReadingPassageTab
            blocks={blocks}
            contentTitle={contentTitle}
            imageUrl={imageUrl}
          />
        )}
        {activeTab === 'questions' && (
          <ReadingQuestionsTab subquestions={subquestions} />
        )}
        {activeTab === 'vocab' && (
          <ReadingVocabTab supplementNorms={supplementNorms} />
        )}
      </ScrollView>
    </View>
  );
}

function ReadingPassageTab({
  blocks,
  contentTitle,
  imageUrl,
}: {
  blocks: QuizQuestion['content']['blocks'];
  contentTitle: string;
  imageUrl?: string;
}) {
  const list = blocks ?? [];
  if (list.length === 0 && !imageUrl) {
    return (
      <View className="py-8">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có nội dung bài đọc.
        </Text>
      </View>
    );
  }
  return (
    <View className="mt-4 gap-4">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-48 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800"
          resizeMode="contain"
        />
      ) : null}
      {contentTitle ? (
        <Text className="text-center text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {contentTitle}
        </Text>
      ) : null}
      {list.map((block, bIdx) => (
        <View key={block.id ?? bIdx} className="gap-2">
          {(block.sentences ?? []).map((s, sIdx) => (
            <Text
              key={s.id ?? sIdx}
              className="text-base leading-relaxed text-neutral-900 dark:text-neutral-100"
            >
              {s.text ?? ''}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function ReadingQuestionsTab({
  subquestions,
}: {
  subquestions: QuizQuestion['content']['subquestions'];
}) {
  const list = subquestions ?? [];
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const onSelect = React.useCallback((subId: string, optionId: string) => {
    setAnswers((prev) => {
      if (prev[subId] != null) return prev;
      return { ...prev, [subId]: optionId };
    });
  }, []);

  if (list.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có câu hỏi bài đọc.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4 gap-6">
      {list.map((sq, idx) => (
        <ReadingSubQuestionCard
          key={sq.id ?? idx}
          subquestion={sq}
          questionNumber={idx + 1}
          selectedId={answers[sq.id ?? '']}
          onSelect={(optionId) => onSelect(sq.id ?? String(idx), optionId)}
        />
      ))}
    </View>
  );
}

function ReadingSubQuestionCard({
  subquestion,
  questionNumber,
  selectedId,
  onSelect,
}: {
  subquestion: QuizSubQuestion;
  questionNumber: number;
  selectedId?: string;
  onSelect: (optionId: string) => void;
}) {
  const questionText =
    subquestion.content?.question ?? subquestion.content?.questionVi ?? '';
  const options = subquestion.content?.options ?? [];
  const correctIds =
    (subquestion.answerSpec as { correct_options?: string[] } | undefined)
      ?.correct_options ?? options.filter((o) => o.isCorrect).map((o) => o.id).filter(Boolean);
  const canGrade = correctIds.length > 0;
  const hasAnswered = Boolean(selectedId);

  return (
    <View className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
      <Text className="mb-3 text-base font-medium text-neutral-900 dark:text-neutral-100">
        {questionNumber}. {questionText}
      </Text>
      <View className="gap-2">
        {options.map((o) => {
          const optId = o.id ?? '';
          const isCorrect = canGrade ? correctIds.includes(optId) : false;
          const isSelected = selectedId === optId;
          const label = o.text ?? o.textVi ?? optId;

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
              onPress={() => hasAnswered ? undefined : onSelect(optId)}
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

function ReadingVocabTab({
  supplementNorms,
}: {
  supplementNorms: string[];
}) {
  if (supplementNorms.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có danh sách từ vựng. Bạn có thể ôn từ vựng trong bài học Từ vựng của khóa.
        </Text>
      </View>
    );
  }
  return (
    <View className="mt-4 gap-2">
      <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
        Từ vựng trong bài
      </Text>
      {supplementNorms.map((norm) => (
        <View
          key={norm}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-800/50"
        >
          <Text className="text-base text-neutral-900 dark:text-neutral-100">
            {norm}
          </Text>
        </View>
      ))}
    </View>
  );
}
