import { flowLabels, moodLabels, strings, tagLabels } from '../i18n/en';
import type { DayEntry } from '../db/types';

// Human-readable summary lines for a day entry (Today screen and History).
export function entrySummaryLines(entry: DayEntry): string[] {
  const lines: string[] = [];
  if (entry.flow !== null) lines.push(`${strings.logFlow}: ${flowLabels[entry.flow]}`);
  if (entry.mood !== null) lines.push(`${strings.logMood}: ${moodLabels[entry.mood]}`);
  if (entry.pain !== null) lines.push(`${strings.logPain}: ${strings.painValue(entry.pain)}`);
  const tags = [...entry.moodTags, ...entry.painTags, ...entry.symptoms].map((tag) => tagLabels[tag] ?? tag);
  if (tags.length > 0) lines.push(tags.join(', '));
  if (entry.note !== '') lines.push(entry.note);
  return lines;
}
