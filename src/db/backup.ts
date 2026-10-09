import { format } from 'date-fns';
import type { CadenceDB } from './db';
import { BACKUP_SCHEMA_VERSION } from '../logic/config';
import type { DayEntry, Period, Settings } from './types';

export interface BackupFile {
  app: 'cadence';
  schemaVersion: number;
  exportedAt: string;
  periods: Period[];
  entries: DayEntry[];
  settings: Record<string, unknown>;
}

export type ImportMode = 'merge' | 'replace';

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
  if (typeof backup.settings !== 'object' || backup.settings === null) return null;
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
      await database.settings.bulkPut(Object.values(backup.settings) as Settings[]);
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
