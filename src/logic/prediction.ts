import {
  DEFAULT_PREDICTED_PERIOD_LENGTH,
  PREDICTION_CYCLES_CONSIDERED,
  PREDICTION_ESTIMATE_RANGE_DAYS,
  PREDICTION_IRREGULAR_MULTIPLIER,
  PREDICTION_MIN_COMPLETED_CYCLES,
  PREDICTION_MIN_RANGE_DAYS,
} from './config';
import { addDaysToDay, diffDays } from './dates';
import { completedCycles, deriveCycles } from './cycles';
import { overallPatternLabel } from './regularity';
import { mean, stdDev } from './stats';
import type { Period } from '../db/types';

export interface PeriodPrediction {
  predictedStart: string;       // center of the range, YYYY-MM-DD
  rangeStart: string;           // earliest predicted start (always labeled an estimate)
  rangeEnd: string;             // latest predicted start
  predictedPeriodLength: number;
  basedOnEstimate: boolean;     // true when using the onboarding typical length
  lessReliable: boolean;        // pattern is irregular
}

// Spec 7.4. Predicted cycle length = mean of the last up to
// PREDICTION_CYCLES_CONSIDERED completed cycle lengths, rounded to the nearest
// whole day so it can be added to a date. Range = mean ± max(2, round(sd)),
// widened when the pattern is irregular. Predicted period length = mean of
// past period lengths (fallback DEFAULT_PREDICTED_PERIOD_LENGTH).
export function predictNextPeriod(periods: Period[], typicalCycleLength: number | null): PeriodPrediction | null {
  const cycles = deriveCycles(periods);
  const completed = completedCycles(cycles);
  const lastStart = cycles.length > 0 ? cycles[cycles.length - 1].startDate : null;
  if (lastStart === null) return null;

  let predictedCycleLength: number;
  let rangeDays: number;
  let basedOnEstimate = false;

  if (completed.length >= PREDICTION_MIN_COMPLETED_CYCLES) {
    const lengths = completed.slice(-PREDICTION_CYCLES_CONSIDERED).map((cycle) => cycle.cycleLength as number);
    predictedCycleLength = Math.round(mean(lengths));
    rangeDays = Math.max(PREDICTION_MIN_RANGE_DAYS, Math.round(stdDev(lengths)));
  } else if (typicalCycleLength !== null && typicalCycleLength > 0) {
    // Onboarding estimate, clearly marked (spec 7.4 / 4.6).
    predictedCycleLength = Math.round(typicalCycleLength);
    rangeDays = PREDICTION_ESTIMATE_RANGE_DAYS;
    basedOnEstimate = true;
  } else {
    return null;
  }

  const lessReliable = overallPatternLabel(cycles) === 'irregular';
  if (lessReliable) rangeDays = rangeDays * PREDICTION_IRREGULAR_MULTIPLIER;

  const predictedStart = addDaysToDay(lastStart, predictedCycleLength);
  const periodLengths = periods
    .filter((period) => period.endDate !== null)
    .map((period) => diffDays(period.endDate as string, period.startDate) + 1);
  const predictedPeriodLength =
    periodLengths.length > 0 ? Math.round(mean(periodLengths)) : DEFAULT_PREDICTED_PERIOD_LENGTH;

  return {
    predictedStart,
    rangeStart: addDaysToDay(predictedStart, -rangeDays),
    rangeEnd: addDaysToDay(predictedStart, rangeDays),
    predictedPeriodLength,
    basedOnEstimate,
    lessReliable,
  };
}

export function isPredictionPassed(
  prediction: PeriodPrediction | null,
  day: string,
  hasOngoingPeriod: boolean,
): boolean {
  if (prediction === null || hasOngoingPeriod) {
    return false;
  }
  return prediction.rangeEnd < day;
}
