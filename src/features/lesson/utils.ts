/**
 * Map lesson type (API code or string) to primary type.
 * Grammar type ('2' or 'grammar') → show grammar list only (no tabs).
 */
export type LessonPrimaryType =
  | 'vocab'
  | 'grammar'
  | 'knowledge'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'test'
  | 'exam'
  | 'practice';

const LESSON_TYPE_CODE_MAP: Record<string, LessonPrimaryType> = {
  '1': 'vocab',
  '2': 'grammar',
  '3': 'reading',
  '4': 'listening',
  '5': 'speaking',
  '6': 'writing',
  '7': 'test',
  practice: 'practice',
  exam: 'exam',
  vocab: 'vocab',
  grammar: 'grammar',
  knowledge: 'knowledge',
  reading: 'reading',
  listening: 'listening',
  speaking: 'speaking',
  writing: 'writing',
  test: 'test',
};

export function getLessonPrimaryType(
  typeValue?: string | number | null,
): LessonPrimaryType | undefined {
  if (typeValue == null) return undefined;
  const normalized = String(typeValue).trim();
  return LESSON_TYPE_CODE_MAP[normalized];
}
