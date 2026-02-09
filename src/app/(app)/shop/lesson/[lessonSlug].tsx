import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { FocusAwareStatusBar } from '@/components/ui';
import {
  useLessonDetail,
  useLessonFlashcardSets,
  useLessonGrammars,
  useLessonQuestions,
} from '@/features/lesson/api';
import {
  GrammarList,
  LessonContentPlaceholder,
  ListeningContent,
  QuizSets,
  ReadingContent,
  VocabSetList,
} from '@/features/lesson/components';
import { getLessonPrimaryType } from '@/features/lesson/utils';

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
  const { questions: setQuestions, isLoading: setQuestionsLoading } =
    useLessonQuestions(
      primaryType === 'reading' || primaryType === 'listening' ? slug : null,
    );
  const readingQuestion = setQuestions?.find(
    (q) => (q.questionType ?? '').toUpperCase() === 'READING_SET',
  );
  const listeningQuestion = setQuestions?.find(
    (q) => (q.questionType ?? '').toUpperCase() === 'LISTENING_SET',
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

  const renderContent = () => {
    if (primaryType === 'grammar') {
      if (grammarsLoading) return <Text className="text-neutral-500">Đang tải ngữ pháp...</Text>;
      return <GrammarList grammars={grammars} />;
    }
    if (primaryType === 'vocab') {
      if (vocabLoading) return <Text className="text-neutral-500">Đang tải từ vựng...</Text>;
      return <VocabSetList sets={vocabSets} />;
    }
    if (primaryType === 'test' || primaryType === 'practice') {
      return <QuizSets lessonSlug={slug} />;
    }
    if (primaryType === 'reading') {
      if (setQuestionsLoading) {
        return <Text className="text-neutral-500">Đang tải bài đọc...</Text>;
      }
      if (readingQuestion) {
        return <ReadingContent question={readingQuestion} />;
      }
      return (
        <Text className="text-neutral-500 dark:text-neutral-400">
          Chưa có nội dung bài đọc.
        </Text>
      );
    }
    if (primaryType === 'listening') {
      if (setQuestionsLoading) {
        return <Text className="text-neutral-500">Đang tải bài nghe...</Text>;
      }
      if (listeningQuestion) {
        return <ListeningContent question={listeningQuestion} />;
      }
      return (
        <Text className="text-neutral-500 dark:text-neutral-400">
          Chưa có nội dung bài nghe.
        </Text>
      );
    }
    return <LessonContentPlaceholder />;
  };

  const isSetWithTabs =
    (primaryType === 'reading' && !setQuestionsLoading && readingQuestion) ||
    (primaryType === 'listening' && !setQuestionsLoading && listeningQuestion);

  return (
    <>
      <FocusAwareStatusBar />
      {isSetWithTabs ? (
        <View className="flex-1 px-4 pt-4">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>
          {lesson.code ? (
            <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {lesson.code}
            </Text>
          ) : null}
          <View className="mt-4 flex-1">{renderContent()}</View>
        </View>
      ) : (
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
          <View className="mt-6">{renderContent()}</View>
        </ScrollView>
      )}
    </>
  );
}
