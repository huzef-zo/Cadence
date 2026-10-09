import { describe, expect, it } from 'vitest';
import { displayedPatternLabel, overallPatternLabel, singleCycleLabel, singleCycleNote } from './regularity';
import type { Cycle } from './types';

let seq = 0;
function cycleOf(cycleLength: number | null): Cycle {
  seq += 1;
  return { startDate: `2000-01-${String(seq).padStart(2, '0')}`, periodEndDate: null, periodLength: 4, cycleLength };
}

describe('single cycle label boundaries (exactly at thresholds)', () => {
  it('labels 24 and 38 as within the typical range', () => {
    expect(singleCycleLabel(24)).toBe('within-typical-range');
    expect(singleCycleLabel(38)).toBe('within-typical-range');
  });

  it('labels 23 and 39 as outside the typical range', () => {
    expect(singleCycleLabel(23)).toBe('outside-typical-range');
    expect(singleCycleLabel(39)).toBe('outside-typical-range');
  });

  it('gives a neutral short/long note outside the range', () => {
    expect(singleCycleNote(23)).toBe('short');
    expect(singleCycleNote(39)).toBe('long');
    expect(singleCycleNote(28)).toBeNull();
  });
});

describe('overall pattern boundaries', () => {
  it('is "not enough data" with fewer than 3 completed cycles', () => {
    expect(overallPatternLabel([cycleOf(28), cycleOf(28)])).toBe('not-enough-data');
  });

  it('is regular with exactly 3 completed cycles', () => {
    expect(overallPatternLabel([cycleOf(28), cycleOf(28), cycleOf(28)])).toBe('regular');
  });

  it('is regular at exactly the variation threshold (max - min = 9)', () => {
    expect(overallPatternLabel([cycleOf(26), cycleOf(26), cycleOf(35)])).toBe('regular');
  });

  it('is irregular one day past the variation threshold (max - min = 10)', () => {
    expect(overallPatternLabel([cycleOf(26), cycleOf(26), cycleOf(36)])).toBe('irregular');
  });

  it('is regular with a cycle at the range minimum and variation of exactly 9', () => {
    expect(overallPatternLabel([cycleOf(24), cycleOf(33), cycleOf(28)])).toBe('regular');
  });

  it('is irregular when any considered cycle is outside the typical range', () => {
    expect(overallPatternLabel([cycleOf(24), cycleOf(28), cycleOf(39)])).toBe('irregular');
  });

  it('only considers the most recent 6 completed cycles', () => {
    const sevenCycles = [cycleOf(45), cycleOf(28), cycleOf(28), cycleOf(28), cycleOf(28), cycleOf(28), cycleOf(28)];
    expect(overallPatternLabel(sevenCycles)).toBe('regular');
  });

  it('ignores the ongoing cycle (no length yet)', () => {
    expect(overallPatternLabel([cycleOf(28), cycleOf(28), cycleOf(28), cycleOf(null)])).toBe('regular');
  });
});

describe('manual override (4.3)', () => {
  it('replaces the displayed label only', () => {
    expect(displayedPatternLabel('not-enough-data', 'regular')).toBe('regular');
    expect(displayedPatternLabel('regular', 'auto')).toBe('regular');
    expect(displayedPatternLabel('regular', 'irregular')).toBe('irregular');
  });
});
