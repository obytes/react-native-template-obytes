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

/** One vocab/flashcard set for a lesson. */
export type LessonFlashcardSet = {
  key: string;
  title: string;
  cardCount: number;
  setInfo?: Record<string, unknown>;
  cards?: unknown[];
};

type FlashcardsResponse = {
  data?: Record<
    string,
    { cards?: unknown[]; set_info?: Record<string, unknown> }
  >;
};

export function useLessonFlashcardSets(lessonSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['lesson-flashcards', lessonSlug ?? ''],
    queryFn: async (): Promise<LessonFlashcardSet[]> => {
      const slug = (lessonSlug ?? '').trim();
      if (!slug) return [];
      const res = await client.get<FlashcardsResponse>(
        `/lesson-content/lesson/slug/${encodeURIComponent(slug)}/flashcards`,
      );
      const data = res.data?.data ?? {};
      return Object.entries(data).map(([key, payload]) => {
        const setInfo = payload?.set_info as { title?: string; name?: string } | undefined;
        const title =
          (typeof setInfo?.title === 'string' && setInfo.title.trim()
            ? setInfo.title
            : typeof setInfo?.name === 'string' && setInfo.name.trim()
              ? setInfo.name
              : undefined) ?? `Bộ từ vựng ${key}`;
        const cardCount = Array.isArray(payload?.cards) ? payload.cards.length : 0;
        return {
          key,
          title,
          cardCount,
          setInfo: payload?.set_info,
          cards: payload?.cards,
        };
      });
    },
    enabled: !!lessonSlug?.trim(),
    staleTime: 60 * 1000,
  });

  return {
    sets: query.data ?? [],
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
