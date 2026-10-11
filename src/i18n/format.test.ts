import { describe, expect, it } from 'vitest';
import {
  formatDayLong,
  formatMonthYear,
  resolveWeekStart,
  weekdayLabels,
} from './format';

describe('i18n formatting functions', () => {
  it('formatDayLong formats English date correctly', () => {
    expect(formatDayLong('en', '2026-10-09')).toBe('October 9, 2026');
  });

  it('formatMonthYear formats English month/year correctly', () => {
    expect(formatMonthYear('en', new Date(2026, 9, 1))).toBe('October 2026');
  });

  it('weekdayLabels returns expected English ordered arrays', () => {
    expect(weekdayLabels('en', 0)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(weekdayLabels('en', 1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(weekdayLabels('en', 6)).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('formats non-English (ar and am) without Arabic-Indic digits and with Latin year', () => {
    const arabicDigitsRegex = /[\u0660-\u0669\u06F0-\u06F9]/;

    for (const lang of ['ar', 'am'] as const) {
      const dayStr = formatDayLong(lang, '2026-10-09');
      const monthStr = formatMonthYear(lang, new Date(2026, 9, 1));

      expect(dayStr.length).toBeGreaterThan(0);
      expect(monthStr.length).toBeGreaterThan(0);

      expect(dayStr).not.toBe(formatDayLong('en', '2026-10-09'));
      expect(monthStr).not.toBe(formatMonthYear('en', new Date(2026, 9, 1)));

      expect(dayStr).not.toMatch(arabicDigitsRegex);
      expect(monthStr).not.toMatch(arabicDigitsRegex);

      expect(dayStr).toContain('2026');
      expect(monthStr).toContain('2026');
    }
  });

  it('resolveWeekStart maps explicit choices and language defaults', () => {
    expect(resolveWeekStart('sunday', 'en')).toBe(0);
    expect(resolveWeekStart('monday', 'en')).toBe(1);
    expect(resolveWeekStart('saturday', 'en')).toBe(6);

    expect(resolveWeekStart('default', 'ar')).toBe(6);
    expect(resolveWeekStart('default', 'en')).toBe(0);
    expect(resolveWeekStart('default', 'am')).toBe(0);
  });
});
