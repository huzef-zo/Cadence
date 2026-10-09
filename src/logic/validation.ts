import { diffDays } from './dates';
import type { Period } from '../db/types';

export type PeriodValidationError = 'end-before-start' | 'overlap' | null;

const OPEN_ENDED = '9999-12-31'; // sentinel: an ongoing period (endDate null) has no end yet

function overlaps(aStart: string, aEnd: string | null, bStart: string, bEnd: string | null): boolean {
  const aEndEffective = aEnd ?? OPEN_ENDED;
  const bEndEffective = bEnd ?? OPEN_ENDED;
  return aStart <= bEndEffective && bStart <= aEndEffective;
}

// Validates against spec 4.1: end date cannot be before start date; periods
// cannot overlap (inclusive day-level ranges). Pass ignoreId when editing an
// existing period so it does not flag itself.
export function validatePeriod(
  startDate: string,
  endDate: string | null,
  existing: Period[],
  ignoreId?: string,
): PeriodValidationError {
  if (endDate !== null && diffDays(endDate, startDate) < 0) return 'end-before-start';
  for (const period of existing) {
    if (ignoreId !== undefined && period.id === ignoreId) continue;
    if (overlaps(startDate, endDate, period.startDate, period.endDate)) return 'overlap';
  }
  return null;
}
