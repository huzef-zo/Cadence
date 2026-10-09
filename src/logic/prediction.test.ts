import { describe, expect, it } from 'vitest';
import { predictNextPeriod } from './prediction';
import { addDaysToDay, diffDays } from './dates';
import type { Period } from '../db/types';

function period(start: string, end: string | null): Period {
  return { id: start, startDate: start, endDate: end, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' };
}

const TWO_COMPLETED = [
  period('2025-01-01', '2025-01-05'),
  period('2025-01-29', '2025-02-02'),
  period('2025-02-28', '2025-03-04'),
];

describe('predictNextPeriod', () => {
  it('returns null without periods', () => {
    expect(predictNextPeriod([], null)).toBeNull();
  });

  it('returns null with fewer than 2 completed cycles and no estimate', () => {
    expect(predictNextPeriod([period('2025-01-01', '2025-01-05')], null)).toBeNull();
  });

  it('predicts from the mean of completed cycles with a minimum ±2-day range', () => {
    const prediction = predictNextPeriod(TWO_COMPLETED, null)!;
    // completed cycle lengths: 28 (Jan 1 → Jan 29) and 30 (Jan 29 → Feb 28); mean = 29
    expect(diffDays(prediction.predictedStart, '2025-02-28')).toBe(29);
    // sd([28, 30]) ≈ 1.41 → round = 1 → max(2, 1) = 2
    expect(diffDays(prediction.rangeEnd, prediction.predictedStart)).toBe(2);
    expect(diffDays(prediction.rangeStart, prediction.predictedStart)).toBe(-2);
    expect(prediction.predictedPeriodLength).toBe(5); // mean of past period lengths
    expect(prediction.basedOnEstimate).toBe(false);
    expect(prediction.lessReliable).toBe(false);
  });

  it('widens the range when the pattern is irregular', () => {
    const periods = [
      period('2025-01-01', '2025-01-05'),
      period('2025-01-27', '2025-01-31'), // cycle 26
      period('2025-02-22', '2025-02-26'), // cycle 26
      period('2025-04-08', '2025-04-12'), // cycle 45
    ];
    const prediction = predictNextPeriod(periods, null)!;
    // mean(26, 26, 45) ≈ 32.33 → 32; sd ≈ 10.97 → range 11 → widened ×2 = 22
    expect(diffDays(prediction.predictedStart, '2025-04-08')).toBe(32);
    expect(diffDays(prediction.rangeEnd, prediction.predictedStart)).toBe(22);
    expect(prediction.lessReliable).toBe(true);
  });

  it('falls back to the onboarding estimate, clearly marked', () => {
    const prediction = predictNextPeriod([period('2025-03-01', null)], 30)!;
    expect(prediction.basedOnEstimate).toBe(true);
    expect(diffDays(prediction.predictedStart, '2025-03-01')).toBe(30);
    expect(diffDays(prediction.rangeEnd, prediction.predictedStart)).toBe(2);
    expect(prediction.predictedPeriodLength).toBe(5); // fallback: no ended periods
  });

  it('uses only the last 6 completed cycle lengths', () => {
    const starts: string[] = ['2024-01-01'];
    for (const length of [45, 28, 28, 28, 28, 28, 28, 28]) {
      starts.push(addDaysToDay(starts[starts.length - 1], length));
    }
    const periods = starts.map((start, index) =>
      period(start, index === starts.length - 1 ? null : addDaysToDay(start, 4)),
    );
    const prediction = predictNextPeriod(periods, null)!;
    // the 45-day outlier is excluded; mean of the last 6 = 28
    expect(diffDays(prediction.predictedStart, starts[starts.length - 1])).toBe(28);
  });
});
