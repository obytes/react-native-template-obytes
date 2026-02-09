import type { Course } from './types';

import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/api';

/**
 * Fetch course list từ API (cùng endpoint với web: GET /course).
 * Optional slug/code để lấy 1 course.
 */
export function useCourseList(courseSlug?: string | null) {
  const query = useQuery({
    queryKey: ['course-list', courseSlug ?? 'all'],
    queryFn: async (): Promise<Course[]> => {
      if (courseSlug?.trim()) {
        try {
          const res = await client.get<Course>(`/course/by-slug/${courseSlug.trim()}`);
          const course = res.data;
          return course ? [course] : [];
        }
        catch {
          const res = await client.get<{ course?: Course }>(
            `/course/by-code/${courseSlug.trim()}/content`,
          );
          const course = res.data?.course;
          return course ? [course] : [];
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
