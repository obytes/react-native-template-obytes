import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/api';

export type LessonDetail = {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  code?: string;
  [key: string]: unknown;
};

export function useLessonDetail(lessonSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['lesson-detail', lessonSlug ?? ''],
    queryFn: async (): Promise<LessonDetail> => {
      const slug = (lessonSlug ?? '').trim();
      if (!slug) throw new Error('lesson slug required');
      const res = await client.get<LessonDetail>(`/lesson/slug/${encodeURIComponent(slug)}`);
      return res.data;
    },
    enabled: !!lessonSlug?.trim(),
    staleTime: 60 * 1000,
  });

  return {
    lesson: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
