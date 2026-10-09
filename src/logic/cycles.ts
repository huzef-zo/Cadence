import { diffDays } from './dates';
import type { Period } from '../db/types';
import type { Cycle } from './types';

// Cycles are derived, not stored (spec 6): cycle N runs from period N's start
// to the day before period N+1's start. The most recent (ongoing) cycle has
// no length yet (spec 7.1).
export function deriveCycles(periods: Period[]): Cycle[] {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return sorted.map((period, index) => {
    const next = sorted[index + 1];
    return {
      startDate: period.startDate,
      periodEndDate: period.endDate ?? null,
      periodLength: period.endDate !== null ? diffDays(period.endDate, period.startDate) + 1 : null, // inclusive, spec 7.2
      cycleLength: next ? diffDays(next.startDate, period.startDate) : null,
    };
  });
}

export function completedCycles(cycles: Cycle[]): Cycle[] {
  return cycles.filter((cycle) => cycle.cycleLength !== null);
}
