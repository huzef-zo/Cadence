import { format } from 'date-fns';
import { singleCycleLabel } from './regularity';
import type { Cycle } from './types';

function csvField(value: string | number | null): string {
  if (value === null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Simple doctor-visit cycle summary (optional feature, spec 4.8).
export function cyclesToCsv(cycles: Cycle[]): string {
  const header = ['cycle_start', 'period_end', 'period_length_days', 'cycle_length_days', 'label'];
  const rows = cycles.map((cycle) =>
    [
      cycle.startDate,
      cycle.periodEndDate,
      cycle.periodLength,
      cycle.cycleLength,
      cycle.cycleLength !== null ? singleCycleLabel(cycle.cycleLength) : null,
    ]
      .map(csvField)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function summaryFilename(now = new Date()): string {
  return `cadence-summary-${format(now, 'yyyy-MM-dd')}.csv`;
}
