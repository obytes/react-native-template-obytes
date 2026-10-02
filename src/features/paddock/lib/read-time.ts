export const WORDS_PER_MINUTE = 200;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/** Reading time in whole minutes: 200 wpm, rounded up, minimum 1. */
export function readMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(Math.max(0, wordCount) / WORDS_PER_MINUTE));
}

/** "3 min read", or null when we have no story text to measure. */
export function readTimeLabel(story: { wordCount?: number | null; body?: string | null }): string | null {
  const words = story.wordCount ?? (story.body ? countWords(story.body) : null);
  if (words === null || words === undefined)
    return null;
  return `${readMinutes(words)} min read`;
}
