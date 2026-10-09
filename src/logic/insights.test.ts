import { describe, expect, it } from 'vitest';
import type { DayEntry } from '../db/types';
import {
  averageByCycleDay,
  cycleLengthSeries,
  cycleSummary,
  flowDistribution,
  periodLengthSeries,
  topSymptoms,
} from './insights';
import type { Cycle } from './types';

function createEntry(overrides: Partial<DayEntry> & { date: string }): DayEntry {
  return {
    flow: null,
    mood: null,
    moodTags: [],
    pain: null,
    painTags: [],
    symptoms: [],
    note: '',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('insights', () => {
  describe('cycleLengthSeries', () => {
    it('returns empty array for empty input', () => {
      expect(cycleLengthSeries([])).toEqual([]);
    });

    it('returns completed cycles oldest first', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 30 },
      ];
      expect(cycleLengthSeries(cycles)).toEqual([
        { startDate: '2025-01-01', value: 28 },
        { startDate: '2025-01-29', value: 30 },
      ]);
    });

    it('excludes ongoing cycle where cycleLength is null', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: null, periodLength: null, cycleLength: null },
      ];
      expect(cycleLengthSeries(cycles)).toEqual([
        { startDate: '2025-01-01', value: 28 },
      ]);
    });

    it('caps output to last 12 completed cycles (13 in, 12 out)', () => {
      const cycles: Cycle[] = Array.from({ length: 13 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return {
          startDate: `2024-${month}-01`,
          periodEndDate: `2024-${month}-05`,
          periodLength: 5,
          cycleLength: 28 + i,
        };
      });

      const series = cycleLengthSeries(cycles);
      expect(series).toHaveLength(12);
      expect(series[0].startDate).toBe('2024-02-01');
      expect(series[0].value).toBe(29);
      expect(series[11].startDate).toBe('2024-13-01');
      expect(series[11].value).toBe(40);
    });
  });

  describe('periodLengthSeries', () => {
    it('returns empty array for empty input', () => {
      expect(periodLengthSeries([])).toEqual([]);
    });

    it('skips cycles where periodLength is null', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: null, periodLength: null, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 30 },
      ];
      expect(periodLengthSeries(cycles)).toEqual([
        { startDate: '2025-01-29', value: 5 },
      ]);
    });

    it('caps output to last 12 completed cycles with period length (13 in, 12 out)', () => {
      const cycles: Cycle[] = Array.from({ length: 13 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return {
          startDate: `2025-01-${day}`,
          periodEndDate: `2025-01-${day}`,
          periodLength: 4 + (i % 3),
          cycleLength: 28,
        };
      });

      const series = periodLengthSeries(cycles);
      expect(series).toHaveLength(12);
      expect(series[0].startDate).toBe('2025-01-02');
    });
  });

  describe('cycleSummary', () => {
    it('returns null for empty or ongoing-only cycles', () => {
      expect(cycleSummary([])).toBeNull();
      expect(
        cycleSummary([
          { startDate: '2025-01-01', periodEndDate: null, periodLength: null, cycleLength: null },
        ]),
      ).toBeNull();
    });

    it('calculates average, min, max, count and rounds average to whole day', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 29 },
        { startDate: '2025-02-27', periodEndDate: '2025-03-03', periodLength: 5, cycleLength: 32 },
      ];
      // (28 + 29 + 32) / 3 = 29.666... -> rounds to 30
      expect(cycleSummary(cycles)).toEqual({
        average: 30,
        min: 28,
        max: 32,
        count: 3,
      });
    });
  });

  describe('averageByCycleDay', () => {
    it('returns empty array when fewer than 2 completed cycles have data for the field', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 28 },
      ];
      const entries: DayEntry[] = [
        createEntry({ date: '2025-01-01', pain: 6 }), // cycle 1 has data
      ];

      expect(averageByCycleDay(cycles, entries, 'pain')).toEqual([]);
    });

    it('returns average rounded to 1 decimal place and count per day when min cycles threshold met', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 28 },
      ];
      const entries: DayEntry[] = [
        // Cycle 1: day 1 pain 5, day 2 pain 8
        createEntry({ date: '2025-01-01', pain: 5 }),
        createEntry({ date: '2025-01-02', pain: 8 }),
        // Cycle 2: day 1 pain 4, day 2 pain 6
        createEntry({ date: '2025-01-29', pain: 4 }),
        createEntry({ date: '2025-01-30', pain: 6 }),
      ];

      // Day 1 avg: (5 + 4) / 2 = 4.5, count: 2
      // Day 2 avg: (8 + 6) / 2 = 7.0, count: 2
      expect(averageByCycleDay(cycles, entries, 'pain')).toEqual([
        { day: 1, average: 4.5, count: 2 },
        { day: 2, average: 7, count: 2 },
      ]);
    });

    it('ignores null fields and entries outside completed cycles or above max cycle day', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 50 },
        { startDate: '2025-02-20', periodEndDate: '2025-02-24', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-03-20', periodEndDate: null, periodLength: null, cycleLength: null }, // ongoing
      ];
      const entries: DayEntry[] = [
        createEntry({ date: '2025-01-01', mood: 3 }), // cycle 1, day 1
        createEntry({ date: '2025-01-02', mood: null }), // null ignored
        createEntry({ date: '2025-02-11', mood: 5 }), // cycle 1, day 42 (diff 41 + 1 = 42 > 40, ignored)
        createEntry({ date: '2025-02-20', mood: 4 }), // cycle 2, day 1
        createEntry({ date: '2025-03-20', mood: 2 }), // ongoing cycle, ignored
        createEntry({ date: '2024-12-31', mood: 1 }), // before any cycle, ignored
      ];

      // 2 completed cycles have non-null mood entries (cycle 1 on day 1, cycle 2 on day 1)
      // Day 1 avg: (3 + 4) / 2 = 3.5, count: 2
      expect(averageByCycleDay(cycles, entries, 'mood')).toEqual([
        { day: 1, average: 3.5, count: 2 },
      ]);
    });

    it('rounds averages to 1 decimal place', () => {
      const cycles: Cycle[] = [
        { startDate: '2025-01-01', periodEndDate: '2025-01-05', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-01-29', periodEndDate: '2025-02-02', periodLength: 5, cycleLength: 28 },
        { startDate: '2025-02-26', periodEndDate: '2025-03-02', periodLength: 5, cycleLength: 28 },
      ];
      const entries: DayEntry[] = [
        createEntry({ date: '2025-01-01', pain: 2 }),
        createEntry({ date: '2025-01-29', pain: 3 }),
        createEntry({ date: '2025-02-26', pain: 3 }),
      ];
      // Day 1 avg: (2 + 3 + 3) / 3 = 2.666... -> 2.7
      expect(averageByCycleDay(cycles, entries, 'pain')).toEqual([
        { day: 1, average: 2.7, count: 3 },
      ]);
    });
  });

  describe('topSymptoms', () => {
    it('returns empty array when entries have no symptoms', () => {
      expect(topSymptoms([])).toEqual([]);
      expect(topSymptoms([createEntry({ date: '2025-01-01', symptoms: [] })])).toEqual([]);
    });

    it('counts symptoms, sorts by count desc then key asc, capped at top 5', () => {
      const entries: DayEntry[] = [
        createEntry({ date: '2025-01-01', symptoms: ['bloating', 'acne', 'nausea'] }),
        createEntry({ date: '2025-01-02', symptoms: ['bloating', 'cravings', 'acne'] }),
        createEntry({ date: '2025-01-03', symptoms: ['bloating', 'poor_sleep', 'low_energy', 'dizziness'] }),
      ];
      // Counts:
      // bloating: 3
      // acne: 2
      // cravings: 1
      // dizziness: 1
      // low_energy: 1
      // nausea: 1
      // poor_sleep: 1

      // Tie breaking for count 1: cravings, dizziness, low_energy, nausea, poor_sleep (alphabetical)
      // Top 5: bloating (3), acne (2), cravings (1), dizziness (1), low_energy (1)
      const top = topSymptoms(entries);
      expect(top).toEqual([
        { key: 'bloating', count: 3 },
        { key: 'acne', count: 2 },
        { key: 'cravings', count: 1 },
        { key: 'dizziness', count: 1 },
        { key: 'low_energy', count: 1 },
      ]);
    });
  });

  describe('flowDistribution', () => {
    it('returns zeros for empty entries', () => {
      expect(flowDistribution([])).toEqual({
        spotting: 0,
        light: 0,
        medium: 0,
        heavy: 0,
      });
    });

    it('counts flow types while ignoring null and "none"', () => {
      const entries: DayEntry[] = [
        createEntry({ date: '2025-01-01', flow: 'spotting' }),
        createEntry({ date: '2025-01-02', flow: 'light' }),
        createEntry({ date: '2025-01-03', flow: 'medium' }),
        createEntry({ date: '2025-01-04', flow: 'medium' }),
        createEntry({ date: '2025-01-05', flow: 'heavy' }),
        createEntry({ date: '2025-01-06', flow: 'none' }),
        createEntry({ date: '2025-01-07', flow: null }),
      ];

      expect(flowDistribution(entries)).toEqual({
        spotting: 1,
        light: 1,
        medium: 2,
        heavy: 1,
      });
    });
  });
});
