import type {
  CourseContentChapter,
  CourseContentResponse,
  LessonFromContent,
} from '../api';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { CaretDown } from '@/components/ui/icons';

function getChapterTitle(ch: CourseContentChapter, index: number): string {
  return (ch.chapter as { title?: string } | undefined)?.title ?? (ch as { title?: string }).title ?? `Chương ${index + 1}`;
}

function getSectionTitle(sec: { section?: { title?: string }; title?: string }, index: number): string {
  return sec.section?.title ?? sec.title ?? `Phần ${index + 1}`;
}

type LessonNavigatorProps = {
  tree: CourseContentResponse | null | undefined;
  selectedLessonSlug?: string | null;
};

export function LessonNavigator({ tree, selectedLessonSlug }: LessonNavigatorProps) {
  const router = useRouter();
  const [openChapterIndex, setOpenChapterIndex] = React.useState<number | null>(0);
  const [openSectionKey, setOpenSectionKey] = React.useState<string | null>(null);

  const chapters = tree?.chapters ?? [];

  const onLessonPress = React.useCallback(
    (lesson: LessonFromContent) => {
      const slug = lesson.slug ?? lesson.id;
      if (slug) router.push(`/shop/lesson/${slug}`);
    },
    [router],
  );

  if (!tree || chapters.length === 0) {
    return (
      <View className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Danh sách bài học
        </Text>
        <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Đang cập nhật dữ liệu bài học cho khóa này.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <Text className="mb-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
        Danh sách bài học
      </Text>
      <View>
        {chapters.map((chapter, chIndex) => {
          const isChapterOpen = openChapterIndex === chIndex;
          const chapterTitle = getChapterTitle(chapter, chIndex);
          const sections = chapter.sections ?? [];

          return (
            <View
              key={`ch-${chIndex}`}
              className="mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <Pressable
                onPress={() =>
                  setOpenChapterIndex((prev) => (prev === chIndex ? null : chIndex))
                }
                className="flex-row items-center justify-between px-4 py-3 active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Text className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {chIndex + 1}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {chapterTitle}
                  </Text>
                </View>
                <View
                  style={{
                    transform: [{ rotate: isChapterOpen ? '180deg' : '0deg' }],
                  }}
                >
                  <CaretDown />
                </View>
              </Pressable>

              {isChapterOpen && (
                <View className="border-t border-neutral-100 px-2 pb-2 pt-1 dark:border-neutral-700">
                  {sections.map((section, secIndex) => {
                    const sectionKey = `${chIndex}-${secIndex}`;
                    const isSectionOpen = openSectionKey === sectionKey;
                    const sectionTitle = getSectionTitle(section, secIndex);
                    const lessonGroups = section.lessonGroups ?? section.lesson_groups ?? [];

                    return (
                      <View key={sectionKey} className="mb-2">
                        <Pressable
                          onPress={() =>
                            setOpenSectionKey((prev) =>
                              prev === sectionKey ? null : sectionKey,
                            )
                          }
                          className="flex-row items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 active:opacity-80 dark:bg-neutral-800"
                        >
                          <Text className="flex-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            {sectionTitle}
                          </Text>
                          <View
                            style={{
                              transform: [{ rotate: isSectionOpen ? '180deg' : '0deg' }],
                            }}
                          >
                            <CaretDown />
                          </View>
                        </Pressable>

                        {isSectionOpen && (
                          <View className="ml-2 mt-1 space-y-0">
                            {lessonGroups.map((lg) =>
                              (lg.lessons ?? []).map((lesson, lessonIdx) => {
                                const slug = lesson.slug ?? lesson.id;
                                const title = lesson.title ?? lesson.slug ?? lesson.code ?? 'Bài học';
                                const isSelected =
                                  selectedLessonSlug != null && slug === selectedLessonSlug;

                                return (
                                  <Pressable
                                    key={lesson._id ?? lesson.id ?? `${sectionKey}-${lessonIdx}`}
                                    onPress={() => onLessonPress(lesson)}
                                    className={`flex-row items-center gap-3 rounded-lg px-3 py-2.5 active:opacity-80 ${
                                      isSelected
                                        ? 'bg-primary-100 dark:bg-primary-900/40'
                                        : ''
                                    }`}
                                  >
                                    <View
                                      className={`h-7 w-7 items-center justify-center rounded-full ${
                                        isSelected
                                          ? 'bg-primary-500'
                                          : 'border border-primary-400 bg-white dark:bg-neutral-800'
                                      }`}
                                    >
                                      <Text
                                        className={`text-xs font-bold ${
                                          isSelected
                                            ? 'text-white'
                                            : 'text-primary-600 dark:text-primary-400'
                                        }`}
                                      >
                                        {lessonIdx + 1}
                                      </Text>
                                    </View>
                                    <Text
                                      className={`flex-1 text-sm ${
                                        isSelected
                                          ? 'font-semibold text-primary-700 dark:text-primary-300'
                                          : 'text-neutral-800 dark:text-neutral-200'
                                      }`}
                                      numberOfLines={2}
                                    >
                                      {title}
                                    </Text>
                                  </Pressable>
                                );
                              }),
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
