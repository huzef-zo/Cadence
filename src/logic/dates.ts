import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

export const DAY_FORMAT = 'yyyy-MM-dd';

// Parse a YYYY-MM-DD string into a local-time Date (user's local timezone,
// spec 2.7). Never store ambiguous formats.
export function parseDay(day: string): Date {
  return parseISO(day);
}

// Format a Date as a day-level ISO string in the local timezone.
export function toDay(date: Date): string {
  return format(date, DAY_FORMAT);
}

export function today(): string {
  return toDay(new Date());
}

export function addDaysToDay(day: string, amount: number): string {
  return toDay(addDays(parseISO(day), amount));
}

// Whole days from `from` to `to` (positive when `to` is later).
export function diffDays(to: string, from: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function formatDayLong(day: string): string {
  return format(parseISO(day), 'MMMM d, yyyy');
}
