import { describe, expect, it } from 'vitest';
import { en } from './en';
import { moodTagKeys, painTagKeys, symptomKeys } from './keys';

describe('i18n infrastructure and en locale', () => {
  it('contains every tag key from keys.ts in tagLabels', () => {
    const allKeys = [...moodTagKeys, ...painTagKeys, ...symptomKeys];
    for (const key of allKeys) {
      expect(en.tagLabels[key]).toBeDefined();
      expect(typeof en.tagLabels[key]).toBe('string');
      expect(en.tagLabels[key].length).toBeGreaterThan(0);
    }
  });

  it('contains every mood value 1-5 in moodLabels', () => {
    const moods = [1, 2, 3, 4, 5] as const;
    for (const mood of moods) {
      expect(en.moodLabels[mood]).toBeDefined();
      expect(typeof en.moodLabels[mood]).toBe('string');
      expect(en.moodLabels[mood].length).toBeGreaterThan(0);
    }
  });

  it('contains every flow value in flowLabels', () => {
    const flows = ['none', 'spotting', 'light', 'medium', 'heavy'] as const;
    for (const flow of flows) {
      expect(en.flowLabels[flow]).toBeDefined();
      expect(typeof en.flowLabels[flow]).toBe('string');
      expect(en.flowLabels[flow].length).toBeGreaterThan(0);
    }
  });

  it('function-valued strings return expected formatted text', () => {
    expect(en.statusPeriodDay(3)).toBe('Period day 3');
    expect(en.statusCycleDay(14)).toBe('Day 14 of your cycle');
    expect(en.days(3)).toBe('3 days');
    expect(en.painValue(7)).toBe('7 of 10');
    expect(en.noteRemaining(100)).toBe('100 characters left');
    expect(en.predictionRange('2025-01-01', '2025-01-05')).toBe('Next period: around 2025-01-01 to 2025-01-05');
    expect(en.insightsSummary(28, 25, 32, 6)).toBe(
      'Average cycle length: 28 days (range 25–32) across 6 cycles.',
    );
    expect(en.logTitle('January 1, 2025')).toBe('Log for January 1, 2025');
  });
});
