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

/** Speaking dialogue sentence. */
export type LessonSpeakingSentence = {
  id?: string;
  speaker?: string;
  text_en?: string;
  text_vi?: string;
  startMs?: number;
  endMs?: number;
};

/** Speaking block (e.g. one scene). */
export type LessonSpeakingBlock = {
  id?: string;
  type?: string;
  sentences?: LessonSpeakingSentence[];
};

/** One speaking dialogue. */
export type LessonSpeaking = {
  id?: string;
  title?: string;
  tags?: string[];
  difficulty?: string;
  guide_md?: string;
  image_url?: string;
  audio_en_url?: string;
  audio_vi_url?: string;
  blocks?: LessonSpeakingBlock[];
};

type SpeakingsResponse = { data?: (LessonSpeaking & { _id?: string })[]; count?: number };

export function useLessonSpeakings(lessonSlug: string | null | undefined) {
  const query = useQuery({
    queryKey: ['lesson-speakings', lessonSlug ?? ''],
    queryFn: async (): Promise<{ speakings: LessonSpeaking[] }> => {
      const slug = (lessonSlug ?? '').trim();
      if (!slug) return { speakings: [] };
      const res = await client.get<SpeakingsResponse>(
        `/lesson-content/lesson/slug/${encodeURIComponent(slug)}/speakings`,
      );
      const raw = res.data?.data ?? [];
      const speakings: LessonSpeaking[] = raw.map((s) => ({
        ...s,
        id: s._id ?? s.id,
      }));
      return { speakings };
    },
    enabled: !!lessonSlug?.trim(),
    staleTime: 60 * 1000,
  });

  return {
    speakings: query.data?.speakings ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

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

/** Reading block sentence (for READING_SET). */
export type ReadingSentence = {
  id?: string;
  text?: string;
  transVi?: string;
};

/** Reading block (paragraph with sentences). */
export type ReadingBlock = {
  id?: string;
  transVi?: string;
  sentences?: ReadingSentence[];
};

/** Sub-question (e.g. per paragraph in READING_SET). */
export type QuizSubQuestion = {
  id?: string;
  content?: {
    question?: string;
    questionVi?: string;
    options?: QuizOption[];
  };
  answerSpec?: { correct_options?: string[] };
};

/** Quiz question content. */
export type QuizContent = {
  question?: string;
  questionVi?: string;
  guide?: string;
  guideVi?: string;
  options?: QuizOption[];
  /** READING_SET: passage blocks */
  blocks?: ReadingBlock[];
  subquestions?: QuizSubQuestion[];
  supplementNorms?: string[];
  title?: string;
  footer?: string;
  media?: Array<{ type?: string; url?: string }>;
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
type ApiSentence = { id?: string; text?: string; trans_vi?: string };
type ApiBlock = { id?: string; trans_vi?: string; sentences?: ApiSentence[] };
type ApiSubQuestion = {
  id?: string;
  content?: { question?: string; question_vi?: string; options?: ApiOption[] };
  answer_spec?: { correct_options?: string[] };
};
type ApiContent = {
  question?: string; question_vi?: string; guide?: string; guide_vi?: string;
  options?: ApiOption[];
  blocks?: ApiBlock[];
  subquestions?: ApiSubQuestion[];
  supplement_norms?: string[];
  title?: string; footer?: string;
  media?: Array<{ type?: string; url?: string }>;
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

function mapBlock(b: ApiBlock): ReadingBlock {
  return {
    id: b.id,
    transVi: b.trans_vi,
    sentences: b.sentences?.map((s) => ({
      id: s.id,
      text: s.text,
      transVi: s.trans_vi,
    })),
  };
}

function mapSubQuestion(sq: ApiSubQuestion): QuizSubQuestion {
  return {
    id: sq.id,
    content: sq.content
      ? {
          question: sq.content.question,
          questionVi: sq.content.question_vi,
          options: sq.content.options?.map(mapOption),
        }
      : undefined,
    answerSpec: sq.answer_spec,
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
          blocks: c.blocks?.map(mapBlock),
          subquestions: c.subquestions?.map(mapSubQuestion),
          supplementNorms: Array.isArray(c.supplement_norms)
            ? c.supplement_norms.filter((x): x is string => typeof x === 'string')
            : undefined,
          title: c.title,
          footer: c.footer,
          media: c.media,
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
