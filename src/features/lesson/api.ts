import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/api';

export type LessonDetail = {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  code?: string;
  type?: string | number;
  [key: string]: unknown;
};

export type LessonGrammar = {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  summary_vi?: string;
  summary_en?: string;
  description?: string;
  formula?: string;
  points?: LessonGrammar[];
  [key: string]: unknown;
};

type GrammarsResponse = { data?: LessonGrammar[]; count?: number };

export function useLessonGrammars(lessonSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['lesson-grammars', lessonSlug ?? ''],
    queryFn: async (): Promise<{ grammars: LessonGrammar[] }> => {
      const slug = (lessonSlug ?? '').trim();
      if (!slug) return { grammars: [] };
      const res = await client.get<GrammarsResponse>(
        `/lesson-content/lesson/slug/${encodeURIComponent(slug)}/grammars`,
      );
      const list = res.data?.data ?? [];
      return { grammars: list };
    },
    enabled: !!lessonSlug?.trim(),
    staleTime: 60 * 1000,
  });

  return {
    grammars: query.data?.grammars ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

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
