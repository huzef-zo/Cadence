import { describe, expect, it } from 'vitest';
import { deriveCycles } from './cycles';
import type { Period } from '../db/types';

function period(startDate: string, endDate: string | null): Period {
  return { id: startDate, startDate, endDate, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' };
}

describe('deriveCycles', () => {
  it('returns no cycles without periods', () => {
    expect(deriveCycles([])).toEqual([]);
  });

  it('computes cycle length as days between consecutive period starts (7.1)', () => {
    const cycles = deriveCycles([period('2025-01-10', '2025-01-13'), period('2025-02-07', '2025-02-11')]);
    expect(cycles[0].cycleLength).toBe(28);
    expect(cycles[1].cycleLength).toBeNull(); // most recent (ongoing) cycle has no length yet
  });

  it('computes inclusive period length (7.2): Jan 1–Jan 5 = 5 days', () => {
    const cycles = deriveCycles([period('2025-01-01', '2025-01-05'), period('2025-02-01', null)]);
    expect(cycles[0].periodLength).toBe(5);
    expect(cycles[1].periodLength).toBeNull();
  });

  it('sorts periods by start date regardless of input order', () => {
    const cycles = deriveCycles([period('2025-02-01', null), period('2025-01-01', '2025-01-04')]);
    expect(cycles[0].startDate).toBe('2025-01-01');
    expect(cycles[1].startDate).toBe('2025-02-01');
  });
});
