import type { Strings } from '../i18n';
import type { DayEntry } from '../db/types';

// Human-readable summary lines for a day entry (Today screen and History).
export function entrySummaryLines(entry: DayEntry, t: Strings): string[] {
  const lines: string[] = [];
  if (entry.flow !== null) lines.push(`${t.logFlow}: ${t.flowLabels[entry.flow]}`);
  if (entry.mood !== null) lines.push(`${t.logMood}: ${t.moodLabels[entry.mood]}`);
  if (entry.pain !== null) lines.push(`${t.logPain}: ${t.painValue(entry.pain)}`);
  const tags = [...entry.moodTags, ...entry.painTags, ...entry.symptoms].map((tag) => t.tagLabels[tag] ?? tag);
  if (tags.length > 0) lines.push(tags.join(', '));
  if (entry.note !== '') lines.push(entry.note);
  return lines;
}
