import type { ClubEvent } from '@/features/events/types';

/** A single cell in the month grid. `key` is a local `YYYY-MM-DD`. */
export type CalendarCell = {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

export type MonthRef = { year: number; month: number }; // month: 0-11

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-date key `YYYY-MM-DD` for a Date. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local-date key for an ISO timestamp, or null when missing/invalid. */
export function eventDayKey(startsAt: string | null): string | null {
  if (!startsAt)
    return null;
  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? null : dayKey(date);
}

export function monthOf(date: Date): MonthRef {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const d = new Date(ref.year, ref.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/**
 * Month layout, Monday-first (Irish locale). Always whole weeks: leading and
 * trailing days from the neighbouring months are flagged `inMonth: false`.
 */
export function buildMonthGrid(ref: MonthRef, today: Date = new Date()): CalendarCell[][] {
  const first = new Date(ref.year, ref.month, 1);
  const mondayOffset = (first.getDay() + 6) % 7; // Sun=0 -> 6, Mon=0 -> 0
  const daysInMonth = new Date(ref.year, ref.month + 1, 0).getDate();
  const weekCount = Math.ceil((mondayOffset + daysInMonth) / 7);
  const todayKey = dayKey(today);

  const weeks: CalendarCell[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(ref.year, ref.month, 1 - mondayOffset + w * 7 + d);
      const key = dayKey(date);
      week.push({
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === ref.month && date.getFullYear() === ref.year,
        isToday: key === todayKey,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** Events bucketed by local day, each bucket sorted by start time. */
export function groupEventsByDay(events: ClubEvent[]): Map<string, ClubEvent[]> {
  const map = new Map<string, ClubEvent[]>();
  for (const event of events) {
    const key = eventDayKey(event.startsAt);
    if (!key)
      continue;
    const bucket = map.get(key);
    if (bucket)
      bucket.push(event);
    else map.set(key, [event]);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
  }
  return map;
}

export type RsvpState = 'rsvp' | 'going' | 'full' | 'hidden';

/**
 * What the RSVP control shows. A member who is already going always keeps the
 * (cancel) control, even when the event is full (S13-05 Tom decision: no
 * waitlist; full + not going = disabled "Event full").
 */
export function rsvpButtonState(
  event: Pick<ClubEvent, 'rsvp'>,
  rsvpFullError = false,
): RsvpState {
  if (event.rsvp.disabled)
    return 'hidden';
  if (event.rsvp.going)
    return 'going';
  if (event.rsvp.full || rsvpFullError)
    return 'full';
  return 'rsvp';
}

export const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000;

/** When the remind-me notification should fire: 24h before start, or null if that is past/invalid. */
export function reminderTime(startsAt: string | null, now: Date = new Date()): Date | null {
  if (!startsAt)
    return null;
  const start = Date.parse(startsAt);
  if (Number.isNaN(start))
    return null;
  const fireAt = start - REMINDER_LEAD_MS;
  return fireAt > now.getTime() ? new Date(fireAt) : null;
}
