import { db, DEFAULT_SETTINGS } from './db';
import type { DayEntry, Period, Settings } from './types';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Returns the single settings row, creating defaults on first read. Missing
// keys are filled from defaults for forward compatibility.
export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get('main');
  if (existing) return { ...DEFAULT_SETTINGS, ...existing };
  await db.settings.put(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put(settings);
}

export async function listPeriods(): Promise<Period[]> {
  return db.periods.toArray();
}

export async function listEntries(): Promise<DayEntry[]> {
  return db.entries.toArray();
}

export async function getEntry(date: string): Promise<DayEntry | undefined> {
  return db.entries.get(date);
}

export async function saveEntry(date: string, data: Omit<DayEntry, 'date' | 'updatedAt'>): Promise<DayEntry> {
  const entry: DayEntry = { ...data, date, updatedAt: new Date().toISOString() };
  await db.entries.put(entry);
  return entry;
}

export async function createPeriod(startDate: string, endDate: string | null): Promise<Period> {
  const now = new Date().toISOString();
  const period: Period = { id: uuid(), startDate, endDate, createdAt: now, updatedAt: now };
  await db.periods.add(period);
  return period;
}

export async function updatePeriod(period: Period): Promise<void> {
  await db.periods.put({ ...period, updatedAt: new Date().toISOString() });
}

export async function deletePeriod(id: string): Promise<void> {
  await db.periods.delete(id);
}
