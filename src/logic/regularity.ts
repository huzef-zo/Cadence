import {
  CYCLES_CONSIDERED,
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  MAX_VARIATION,
  MIN_CYCLES_FOR_PATTERN,
} from './config';
import type { Cycle } from './types';

export type SingleCycleLabel = 'within-typical-range' | 'outside-typical-range';
export type LengthNote = 'short' | 'long' | null;
export type PatternLabel = 'regular' | 'irregular' | 'not-enough-data';
export type Override = 'auto' | 'regular' | 'irregular';

// Neutral single-cycle label (spec 7.3) — never "normal"/"abnormal".
export function singleCycleLabel(cycleLength: number): SingleCycleLabel {
  return cycleLength >= CYCLE_LENGTH_MIN && cycleLength <= CYCLE_LENGTH_MAX
    ? 'within-typical-range'
    : 'outside-typical-range';
}

export function singleCycleNote(cycleLength: number): LengthNote {
  if (singleCycleLabel(cycleLength) === 'within-typical-range') return null;
  return cycleLength < CYCLE_LENGTH_MIN ? 'short' : 'long';
}

// Overall pattern (spec 7.3): fewer than MIN_CYCLES_FOR_PATTERN completed
// cycles → not enough data; else consider the last CYCLES_CONSIDERED completed
// cycles: regular when (max - min) <= MAX_VARIATION and every one is within
// the typical range, otherwise irregular.
export function overallPatternLabel(cycles: Cycle[]): PatternLabel {
  const completed = cycles.filter((cycle) => cycle.cycleLength !== null);
  if (completed.length < MIN_CYCLES_FOR_PATTERN) return 'not-enough-data';
  const lengths = completed.slice(-CYCLES_CONSIDERED).map((cycle) => cycle.cycleLength as number);
  const allWithinRange = lengths.every((length) => singleCycleLabel(length) === 'within-typical-range');
  const variation = Math.max(...lengths) - Math.min(...lengths);
  return variation <= MAX_VARIATION && allWithinRange ? 'regular' : 'irregular';
}

// Manual override (spec 4.3) replaces the displayed label only; predictions
// still use the computed values.
export function displayedPatternLabel(auto: PatternLabel, override: Override): PatternLabel {
  return override === 'auto' ? auto : override;
}
