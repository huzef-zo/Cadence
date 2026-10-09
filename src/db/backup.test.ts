import { describe, expect, it, vi } from 'vitest';
import { CadenceDB, DEFAULT_SETTINGS } from './db';
import { applyBackup, buildBackup, validateBackup } from './backup';
import type { DayEntry, Period } from './types';

function makePeriod(start: string, end: string | null): Period {
  return { id: `p-${start}`, startDate: start, endDate: end, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' };
}

function makeEntry(date: string): DayEntry {
  return { date, flow: 'light', mood: 4, moodTags: ['calm'], pain: 3, painTags: ['cramps'], symptoms: ['bloating'], note: 'ok', updatedAt: '2025-01-02T00:00:00Z' };
}

function makeValidBackup(): {
  app: 'cadence';
  schemaVersion: number;
  exportedAt: string;
  periods: Period[];
  entries: DayEntry[];
  settings: Record<string, unknown>;
} {
  return {
    app: 'cadence',
    schemaVersion: 1,
    exportedAt: '2025-01-01T00:00:00.000Z',
    periods: [makePeriod('2025-01-01', '2025-01-05')],
    entries: [makeEntry('2025-01-02')],
    settings: { main: { ...DEFAULT_SETTINGS } },
  };
}

describe('backup validation and import', () => {
  it('valid file passes validation', () => {
    const validBackup = makeValidBackup();
    const result = validateBackup(validBackup);
    expect(result).not.toBeNull();
    expect(result?.periods.length).toBe(1);
    expect(result?.entries.length).toBe(1);
  });

  describe('invalid cases rejected', () => {
    it('rejects bad date format and non-existent calendar date', () => {
      const badStartFormat = makeValidBackup();
      badStartFormat.periods[0].startDate = '2025/01/01';
      expect(validateBackup(badStartFormat)).toBeNull();

      const nonExistentDate = makeValidBackup();
      nonExistentDate.periods[0].startDate = '2025-02-31';
      expect(validateBackup(nonExistentDate)).toBeNull();

      const badEntryDate = makeValidBackup();
      badEntryDate.entries[0].date = '2025-13-01';
      expect(validateBackup(badEntryDate)).toBeNull();
    });

    it('rejects end date before start date', () => {
      const endBeforeStart = makeValidBackup();
      endBeforeStart.periods[0].startDate = '2025-01-05';
      endBeforeStart.periods[0].endDate = '2025-01-01';
      expect(validateBackup(endBeforeStart)).toBeNull();
    });

    it('rejects invalid flow value', () => {
      const invalidFlow = makeValidBackup();
      // @ts-expect-error testing invalid flow string
      invalidFlow.entries[0].flow = 'ultra_heavy';
      expect(validateBackup(invalidFlow)).toBeNull();
    });

    it('rejects pain value 11 or out of range', () => {
      const pain11 = makeValidBackup();
      pain11.entries[0].pain = 11;
      expect(validateBackup(pain11)).toBeNull();

      const negativePain = makeValidBackup();
      negativePain.entries[0].pain = -1;
      expect(validateBackup(negativePain)).toBeNull();
    });

    it('rejects note over 500 characters', () => {
      const longNote = makeValidBackup();
      longNote.entries[0].note = 'a'.repeat(501);
      expect(validateBackup(longNote)).toBeNull();
    });

    it('rejects non-array tags or arrays containing non-string elements', () => {
      const nonArrayTags = makeValidBackup();
      // @ts-expect-error testing non-array moodTags
      nonArrayTags.entries[0].moodTags = 'calm';
      expect(validateBackup(nonArrayTags)).toBeNull();

      const nonStringElementTags = makeValidBackup();
      // @ts-expect-error testing non-string in painTags
      nonStringElementTags.entries[0].painTags = ['cramps', 123];
      expect(validateBackup(nonStringElementTags)).toBeNull();

      const nonArraySymptoms = makeValidBackup();
      // @ts-expect-error testing null symptoms
      nonArraySymptoms.entries[0].symptoms = null;
      expect(validateBackup(nonArraySymptoms)).toBeNull();
    });

    it('rejects period with empty or non-string id', () => {
      const emptyId = makeValidBackup();
      emptyId.periods[0].id = '';
      expect(validateBackup(emptyId)).toBeNull();
    });

    it('rejects entry with invalid mood', () => {
      const invalidMood = makeValidBackup();
      // @ts-expect-error testing invalid mood
      invalidMood.entries[0].mood = 6;
      expect(validateBackup(invalidMood)).toBeNull();
    });

    it('rejects invalid settings format', () => {
      const invalidSettings = makeValidBackup();
      // @ts-expect-error testing non-object settings
      invalidSettings.settings = null;
      expect(validateBackup(invalidSettings)).toBeNull();
    });
  });

  it('replace-without-settings case writes DEFAULT_SETTINGS with onboardingDone set to true', async () => {
    const backupNoSettings = makeValidBackup();
    backupNoSettings.settings = {};

    const target = new CadenceDB('cadence-test-replace-no-settings');
    const result = await applyBackup(target, backupNoSettings, 'replace');

    expect(result).toEqual({ periods: 1, entries: 1 });
    const mainSettings = await target.settings.get('main');
    expect(mainSettings).toBeDefined();
    expect(mainSettings).toEqual({
      ...DEFAULT_SETTINGS,
      onboardingDone: true,
    });
  });
});

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

describe('downloadText', () => {
  it('appends anchor to body, clicks it, removes it, and delays revoking object URL', async () => {
    const { downloadText } = await import('./backup');

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
    const revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock; globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    vi.useFakeTimers();

    const appendChildSpy = vi.fn();
    const removeChildSpy = vi.fn();
    const clickSpy = vi.fn();
    const createdAnchor = { href: '', download: '', click: clickSpy };

    const mockDocument = {
      body: {
        appendChild: appendChildSpy,
        removeChild: removeChildSpy,
      },
      createElement: vi.fn().mockReturnValue(createdAnchor),
    };

    const origDocument = globalThis.document;
    // @ts-expect-error mocking minimal document for node test environment
    globalThis.document = mockDocument;

    try {
      downloadText('test.json', '{"test":true}');

      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
      expect(createdAnchor.download).toBe('test.json');
      expect(appendChildSpy).toHaveBeenCalledWith(createdAnchor);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(createdAnchor);
      expect(revokeObjectURLMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
    } finally {
      globalThis.document = origDocument;
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });
});
