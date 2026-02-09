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

/** Quiz option (MCQ). */
export type QuizOption = {
  id?: string;
  text?: string;
  textVi?: string;
  isCorrect?: boolean;
};

/** Quiz question content. */
export type QuizContent = {
  question?: string;
  questionVi?: string;
  guide?: string;
  guideVi?: string;
  options?: QuizOption[];
};

/** Quiz question (MCQ, etc.). */
export type QuizQuestion = {
  id?: string;
  questionType?: string;
  content?: QuizContent;
  answerSpec?: { correct_options?: string[]; [k: string]: unknown };
};

/** One quiz set (list of questions). */
export type QuizQuestionSet = {
  setKey: string;
  title?: string;
  questions: QuizQuestion[];
  count: number;
};

type ApiOption = { id?: string; text?: string; text_vi?: string; is_correct?: boolean };
type ApiContent = {
  question?: string; question_vi?: string; guide?: string; guide_vi?: string;
  options?: ApiOption[];
};
type ApiQuestion = {
  _id?: string; question_type?: string; content?: ApiContent; answer_spec?: { correct_options?: string[] };
};
type QuestionsResponse = {
  data?:
    | ApiQuestion[]
    | Record<string, { set_info?: { title?: string }; questions?: ApiQuestion[] }>;
  count?: number;
};

function mapOption(o: ApiOption): QuizOption {
  return {
    id: o.id,
    text: o.text,
    textVi: o.text_vi,
    isCorrect: o.is_correct === true,
  };
}

function mapQuestion(q: ApiQuestion): QuizQuestion {
  const c = q.content;
  return {
    id: q._id,
    questionType: q.question_type,
    content: c
      ? {
          question: c.question,
          questionVi: c.question_vi,
          guide: c.guide,
          guideVi: c.guide_vi,
          options: c.options?.map(mapOption),
        }
      : undefined,
    answerSpec: q.answer_spec,
  };
}

export function useLessonQuestions(lessonSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['lesson-questions', lessonSlug ?? ''],
    queryFn: async (): Promise<{ sets: QuizQuestionSet[]; questions: QuizQuestion[] }> => {
      const slug = (lessonSlug ?? '').trim();
      if (!slug) return { sets: [], questions: [] };
      const res = await client.get<QuestionsResponse>(
        `/lesson-content/lesson/slug/${encodeURIComponent(slug)}/questions`,
      );
      const payload = res.data?.data;
      if (Array.isArray(payload)) {
        const questions = payload.map(mapQuestion);
        return {
          sets: [{ setKey: 'main', title: 'Quiz', questions, count: questions.length }],
          questions,
        };
      }
      const raw = (payload ?? {}) as Record<string, { set_info?: { title?: string }; questions?: ApiQuestion[] }>;
      const sets: QuizQuestionSet[] = Object.entries(raw).map(([key, s]) => {
        const qs = (s?.questions ?? []).map(mapQuestion);
        const title = s?.set_info?.title ?? key;
        return { setKey: key, title, questions: qs, count: qs.length };
      });
      const questions = sets.flatMap((s) => s.questions);
      return { sets, questions };
    },
    enabled: !!lessonSlug?.trim(),
    staleTime: 60 * 1000,
  });

  return {
    sets: query.data?.sets ?? [],
    questions: query.data?.questions ?? [],
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
