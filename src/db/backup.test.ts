import { describe, expect, it } from 'vitest';
import { CadenceDB, DEFAULT_SETTINGS } from './db';
import { applyBackup, buildBackup, validateBackup } from './backup';
import type { DayEntry, Period } from './types';

function makePeriod(start: string, end: string | null): Period {
  return { id: `p-${start}`, startDate: start, endDate: end, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' };
}

function makeEntry(date: string): DayEntry {
  return { date, flow: 'light', mood: 4, moodTags: ['calm'], pain: 3, painTags: ['cramps'], symptoms: ['bloating'], note: 'ok', updatedAt: '2025-01-02T00:00:00Z' };
}

describe('backup round trip (7.5)', () => {
  it('export → JSON → validate → import (replace) restores the same data', async () => {
    const source = new CadenceDB('cadence-test-source');
    const period = makePeriod('2025-01-01', '2025-01-05');
    const entry = makeEntry('2025-01-02');
    await source.periods.put(period);
    await source.entries.put(entry);
    await source.settings.put({ ...DEFAULT_SETTINGS, typicalCycleLength: 30 });

    const backup = await buildBackup(source);
    const parsed = validateBackup(JSON.parse(JSON.stringify(backup)));
    expect(parsed).not.toBeNull();

    const target = new CadenceDB('cadence-test-target');
    const result = await applyBackup(target, parsed!, 'replace');
    expect(result).toEqual({ periods: 1, entries: 1 });
    expect(await target.periods.toArray()).toEqual([period]);
    expect(await target.entries.toArray()).toEqual([entry]);
    expect((await target.settings.get('main'))?.typicalCycleLength).toBe(30);
  });

  it('merge adds data but keeps current settings', async () => {
    const source = new CadenceDB('cadence-test-merge-source');
    await source.periods.put(makePeriod('2025-02-01', null));

    const backup = await buildBackup(source);
    const target = new CadenceDB('cadence-test-merge-target');
    await target.settings.put({ ...DEFAULT_SETTINGS, theme: 'dark' });

    await applyBackup(target, validateBackup(JSON.parse(JSON.stringify(backup)))!, 'merge');
    expect((await target.periods.toArray()).length).toBe(1);
    expect((await target.settings.get('main'))?.theme).toBe('dark');
  });

  it('rejects files that are not supported Cadence backups', () => {
    expect(validateBackup(null)).toBeNull();
    expect(validateBackup({ app: 'other' })).toBeNull();
    expect(validateBackup({ app: 'cadence', schemaVersion: 99, periods: [], entries: [], settings: {} })).toBeNull();
    expect(validateBackup({ app: 'cadence', schemaVersion: 1, periods: 'x', entries: [], settings: {} })).toBeNull();
  });
});
