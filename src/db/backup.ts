import { format } from 'date-fns';
import type { CadenceDB } from './db';
import { DEFAULT_SETTINGS } from './db';
import { BACKUP_SCHEMA_VERSION } from '../logic/config';
import type { DayEntry, Flow, Period, Settings } from './types';

export interface BackupFile {
  app: 'cadence';
  schemaVersion: number;
  exportedAt: string;
  periods: Period[];
  entries: DayEntry[];
  settings: Record<string, unknown>;
}

export type ImportMode = 'merge' | 'replace';

const ALLOWED_FLOWS = new Set<Flow>(['none', 'spotting', 'light', 'medium', 'heavy']);

function isValidDateString(str: unknown): str is string {
  if (typeof str !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [yearStr, monthStr, dayStr] = str.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
}

function isValidPeriod(p: unknown): p is Period {
  if (typeof p !== 'object' || p === null) return false;
  const period = p as Record<string, unknown>;

  if (typeof period.id !== 'string' || period.id === '') return false;
  if (!isValidDateString(period.startDate)) return false;

  if (period.endDate !== null) {
    if (!isValidDateString(period.endDate)) return false;
    if (period.endDate < (period.startDate as string)) return false;
  }

  if (typeof period.createdAt !== 'string') return false;
  if (typeof period.updatedAt !== 'string') return false;

  return true;
}

function isValidDayEntry(e: unknown): e is DayEntry {
  if (typeof e !== 'object' || e === null) return false;
  const entry = e as Record<string, unknown>;

  if (!isValidDateString(entry.date)) return false;

  if (entry.flow !== null && !ALLOWED_FLOWS.has(entry.flow as Flow)) {
    return false;
  }

  if (entry.mood !== null) {
    if (typeof entry.mood !== 'number' || !Number.isInteger(entry.mood) || entry.mood < 1 || entry.mood > 5) {
      return false;
    }
  }

  if (entry.pain !== null) {
    if (typeof entry.pain !== 'number' || !Number.isInteger(entry.pain) || entry.pain < 0 || entry.pain > 10) {
      return false;
    }
  }

  if (!isStringArray(entry.moodTags)) return false;
  if (!isStringArray(entry.painTags)) return false;
  if (!isStringArray(entry.symptoms)) return false;

  if (typeof entry.note !== 'string' || entry.note.length > 500) return false;

  if (typeof entry.updatedAt !== 'string') return false;

  return true;
}

export async function buildBackup(database: CadenceDB): Promise<BackupFile> {
  const [periods, entries, settings] = await Promise.all([
    database.periods.toArray(),
    database.entries.toArray(),
    database.settings.toArray(),
  ]);
  return {
    app: 'cadence',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    periods,
    entries,
    settings: Object.fromEntries(settings.map((row) => [row.key, row])),
  };
}

// Validates schema and version (spec 4.8); null when not a supported backup.
export function validateBackup(parsed: unknown): BackupFile | null {
  if (typeof parsed !== 'object' || parsed === null) return null;
  const backup = parsed as Partial<BackupFile>;
  if (backup.app !== 'cadence') return null;
  if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION) return null;
  if (!Array.isArray(backup.periods) || !Array.isArray(backup.entries)) return null;
  if (typeof backup.settings !== 'object' || backup.settings === null || Array.isArray(backup.settings)) return null;

  if (!backup.periods.every(isValidPeriod)) return null;
  if (!backup.entries.every(isValidDayEntry)) return null;

  return backup as BackupFile;
}

export async function applyBackup(
  database: CadenceDB,
  backup: BackupFile,
  mode: ImportMode,
): Promise<{ periods: number; entries: number }> {
  await database.transaction('rw', database.periods, database.entries, database.settings, async () => {
    if (mode === 'replace') {
      await Promise.all([database.periods.clear(), database.entries.clear(), database.settings.clear()]);
      const settingsMap = backup.settings as Record<string, Settings>;
      const settingsRows = Object.values(settingsMap);
      const hasMain = settingsRows.some((s) => s && s.key === 'main') || Boolean(settingsMap['main']);
      if (!hasMain) {
        settingsRows.push({ ...DEFAULT_SETTINGS, onboardingDone: true });
      }
      await database.settings.bulkPut(settingsRows);
    }
    await database.periods.bulkPut(backup.periods);
    await database.entries.bulkPut(backup.entries);
    // TODO(spec): whether "merge" should also merge settings is not defined;
    // the simplest safe choice is to keep current settings when merging.
  });
  return { periods: backup.periods.length, entries: backup.entries.length };
}

export function downloadText(filename: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function backupFilename(now = new Date()): string {
  return `cadence-backup-${format(now, 'yyyy-MM-dd')}.json`;
}

export function downloadBackup(backup: BackupFile): void {
  downloadText(backupFilename(), JSON.stringify(backup, null, 2));
}

export async function exportBackup(database: CadenceDB): Promise<void> {
  downloadBackup(await buildBackup(database));
}

export async function readBackupFile(file: File): Promise<BackupFile | null> {
  try {
    return validateBackup(JSON.parse(await file.text()));
  } catch {
    return null;
  }
}
