/** First whitespace-separated token of a display name, or null if there is none. */
export function firstName(name?: string | null): string | null {
  const token = name?.trim().split(/\s+/)[0];
  return token || null;
}
