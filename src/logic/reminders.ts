import { addDaysToDay } from './dates';

// The day on which the "period expected soon" reminder should fire, given the
// predicted start and the daysBefore setting (spec 4.7).
export function periodSoonReminderDate(predictedStart: string, daysBefore: number): string {
  return addDaysToDay(predictedStart, -daysBefore);
}

// Parse "HH:mm" into minutes since midnight; null when invalid.
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (match === null) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutesNow(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}
