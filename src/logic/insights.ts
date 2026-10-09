import type { DayEntry } from '../db/types';
import { addDaysToDay, diffDays } from './dates';
import {
  INSIGHTS_MAX_CYCLE_DAY,
  INSIGHTS_MIN_CYCLES_WITH_DATA,
  INSIGHTS_TOP_SYMPTOMS,
  INSIGHTS_TREND_CYCLES,
} from './insights-config';
import { mean } from './stats';
import type { Cycle } from './types';

export function cycleLengthSeries(cycles: Cycle[]): { startDate: string; value: number }[] {
  const completed = [...cycles]
    .filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return completed.slice(-INSIGHTS_TREND_CYCLES).map((c) => ({
    startDate: c.startDate,
    value: c.cycleLength,
  }));
}

export function periodLengthSeries(cycles: Cycle[]): { startDate: string; value: number }[] {
  const completedWithPeriod = [...cycles]
    .filter(
      (c): c is Cycle & { cycleLength: number; periodLength: number } =>
        c.cycleLength !== null && c.periodLength !== null,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return completedWithPeriod.slice(-INSIGHTS_TREND_CYCLES).map((c) => ({
    startDate: c.startDate,
    value: c.periodLength,
  }));
}

export function cycleSummary(
  cycles: Cycle[],
): { average: number; min: number; max: number; count: number } | null {
  const completedLengths = cycles
    .filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null)
    .map((c) => c.cycleLength);

  if (completedLengths.length === 0) return null;

  const avg = mean(completedLengths);
  const min = Math.min(...completedLengths);
  const max = Math.max(...completedLengths);

  return {
    average: Math.round(avg),
    min,
    max,
    count: completedLengths.length,
  };
}

export function averageByCycleDay(
  cycles: Cycle[],
  entries: DayEntry[],
  field: 'pain' | 'mood',
): { day: number; average: number; count: number }[] {
  const completed = [...cycles]
    .filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const entriesByDate = new Map<string, DayEntry>();
  for (const entry of entries) {
    entriesByDate.set(entry.date, entry);
  }

  let cyclesWithData = 0;
  const dayValues = new Map<number, number[]>();

  for (const cycle of completed) {
    let cycleHasData = false;
    const endDate = addDaysToDay(cycle.startDate, cycle.cycleLength - 1);

    for (const entry of entries) {
      if (entry.date >= cycle.startDate && entry.date <= endDate) {
        const val = entry[field];
        if (val !== null) {
          const cycleDay = diffDays(entry.date, cycle.startDate) + 1;
          if (cycleDay >= 1 && cycleDay <= INSIGHTS_MAX_CYCLE_DAY) {
            cycleHasData = true;
            const current = dayValues.get(cycleDay) ?? [];
            current.push(val);
            dayValues.set(cycleDay, current);
          }
        }
      }
    }

    if (cycleHasData) {
      cyclesWithData++;
    }
  }

  if (cyclesWithData < INSIGHTS_MIN_CYCLES_WITH_DATA) {
    return [];
  }

  const result: { day: number; average: number; count: number }[] = [];
  const sortedDays = Array.from(dayValues.keys()).sort((a, b) => a - b);

  for (const day of sortedDays) {
    const vals = dayValues.get(day)!;
    const avg = mean(vals);
    const roundedAvg = Math.round(avg * 10) / 10;
    result.push({
      day,
      average: roundedAvg,
      count: vals.length,
    });
  }

  return result;
}

export function topSymptoms(entries: DayEntry[]): { key: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const symptom of entry.symptoms) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    }
  }

  const list = Array.from(counts.entries()).map(([key, count]) => ({ key, count }));

  list.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.key.localeCompare(b.key);
  });

  return list.slice(0, INSIGHTS_TOP_SYMPTOMS);
}

export function flowDistribution(
  entries: DayEntry[],
): Record<'spotting' | 'light' | 'medium' | 'heavy', number> {
  const counts: Record<'spotting' | 'light' | 'medium' | 'heavy', number> = {
    spotting: 0,
    light: 0,
    medium: 0,
    heavy: 0,
  };

  for (const entry of entries) {
    if (
      entry.flow === 'spotting' ||
      entry.flow === 'light' ||
      entry.flow === 'medium' ||
      entry.flow === 'heavy'
    ) {
      counts[entry.flow]++;
    }
  }

  return counts;
}
