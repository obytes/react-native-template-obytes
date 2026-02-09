import type { Course } from './types';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { client } from '@/lib/api';

export type LessonFromContent = {
  slug?: string;
  id?: string;
  title?: string;
  code?: string;
  sort?: number;
  [key: string]: unknown;
};

type CourseContentResponse = {
  course?: Course;
  chapters?: Array<{
    sections?: Array<{
      lessonGroups?: Array<{ lessons?: LessonFromContent[] }>;
      lesson_groups?: Array<{ lessons?: LessonFromContent[] }>;
    }>;
  }>;
};

function flattenLessonsFromContent(data: CourseContentResponse): LessonFromContent[] {
  const out: LessonFromContent[] = [];
  const chapters = data?.chapters ?? [];
  for (const ch of chapters) {
    for (const sec of ch.sections ?? []) {
      for (const lg of sec.lessonGroups ?? sec.lesson_groups ?? []) {
        out.push(...(lg.lessons ?? []));
      }
    }
  }
  return out;
}

function sortLessons(lessons: LessonFromContent[]): LessonFromContent[] {
  return [...lessons].sort((a, b) => {
    if (typeof a.sort === 'number' && typeof b.sort === 'number') return a.sort - b.sort;
    if (a.code && b.code) return String(a.code).localeCompare(String(b.code));
    return 0;
  });
}

export function useCourseContent(courseCodeOrSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['course-content', courseCodeOrSlug ?? ''],
    queryFn: async (): Promise<CourseContentResponse> => {
      const key = (courseCodeOrSlug ?? '').trim();
      if (!key) return {};
      try {
        const res = await client.get<CourseContentResponse>(`/course/by-slug/${key}/content`);
        return res.data ?? {};
      } catch {
        const res = await client.get<CourseContentResponse>(`/course/by-code/${key}/content`);
        return res.data ?? {};
      }
    },
    enabled: !!courseCodeOrSlug?.trim(),
    staleTime: 60 * 1000,
  });

  const lessons = React.useMemo(() => {
    if (!query.data) return [];
    return sortLessons(flattenLessonsFromContent(query.data));
  }, [query.data]);

  const firstLessonSlug = lessons[0]?.slug ?? lessons[0]?.id ?? null;

  return {
    data: query.data,
    course: query.data?.course,
    lessons,
    firstLessonSlug,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCourseList(courseSlug?: string | null) {
  const isObjectId = /^[a-f\d]{24}$/i.test(courseSlug?.trim() ?? '');
  const query = useQuery({
    queryKey: ['course-list', courseSlug ?? 'all'],
    queryFn: async (): Promise<Course[]> => {
      if (courseSlug?.trim()) {
        const key = courseSlug.trim();
        if (isObjectId) {
          const res = await client.get<Course[]>('/course');
          const list = res.data ?? [];
          const c = list.find((x) => (x._id ?? x.id) === key);
          return c ? [c] : [];
        }
        try {
          const res = await client.get<Course>(`/course/by-slug/${key}`);
          return res.data ? [res.data] : [];
        } catch {
          const res = await client.get<{ course?: Course }>(`/course/by-code/${key}/content`);
          return res.data?.course ? [res.data.course] : [];
        }
      }
      const res = await client.get<Course[]>('/course');
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
  });

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
