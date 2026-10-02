export type DayPart = 'morning' | 'afternoon' | 'evening';

/** S13-03 §2: morning 05:00–11:59, afternoon 12:00–17:59, evening otherwise (device clock). */
export function dayPart(now: Date): DayPart {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12)
    return 'morning';
  if (hour >= 12 && hour < 18)
    return 'afternoon';
  return 'evening';
}

/** First word of the member's name, or null when there isn't one. */
export function firstName(name: string | null | undefined): string | null {
  const first = name?.trim().split(/\s+/)[0];
  return first || null;
}

/** "Good morning, Sarah", or "Good morning" alone without a name. */
export function greeting(now: Date, name: string | null | undefined): string {
  const base = `Good ${dayPart(now)}`;
  const first = firstName(name);
  return first ? `${base}, ${first}` : base;
}
