import { describe, expect, it } from 'vitest';
import { validatePeriod } from './validation';
import type { Period } from '../db/types';

function period(id: string, start: string, end: string | null): Period {
  return { id, startDate: start, endDate: end, createdAt: '', updatedAt: '' };
}

const EXISTING = [period('a', '2025-01-01', '2025-01-05')];

describe('validatePeriod', () => {
  it('rejects an end date before the start date', () => {
    expect(validatePeriod('2025-02-10', '2025-02-09', [])).toBe('end-before-start');
  });

  it('accepts a non-overlapping period', () => {
    expect(validatePeriod('2025-01-06', '2025-01-09', EXISTING)).toBeNull();
  });

  it('rejects periods sharing a day with an existing period (inclusive days)', () => {
    expect(validatePeriod('2025-01-05', '2025-01-08', EXISTING)).toBe('overlap');
    expect(validatePeriod('2024-12-30', '2025-01-01', EXISTING)).toBe('overlap');
  });

  it('treats an ongoing period as open-ended', () => {
    expect(validatePeriod('2025-03-01', null, [period('b', '2025-02-20', null)])).toBe('overlap');
    expect(validatePeriod('2025-02-01', '2025-02-10', [period('b', '2025-02-20', null)])).toBeNull();
  });

  it('allows editing a period without flagging itself', () => {
    expect(validatePeriod('2025-01-01', '2025-01-05', EXISTING, 'a')).toBeNull();
  });
});
