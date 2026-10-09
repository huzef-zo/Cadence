import { db, DEFAULT_SETTINGS } from './db';
import type { DayEntry, Period, Settings } from './types';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Returns the single settings row, creating defaults on first read. Missing
// keys are filled from defaults for forward compatibility.
export async function getSettings(): Promise<Settings> {
  try {
    const existing = await db.settings.get('main');
    if (existing) return { ...DEFAULT_SETTINGS, ...existing };
    await db.settings.put(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  } catch (err) {
    console.error('Failed to access settings in IndexedDB:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await db.settings.put(settings);
  } catch (err) {
    console.error('Failed to save settings to IndexedDB:', err);
  }
}

export async function listPeriods(): Promise<Period[]> {
  try {
    return await db.periods.toArray();
  } catch (err) {
    console.error('Failed to list periods from IndexedDB:', err);
    return [];
  }
}

export async function listEntries(): Promise<DayEntry[]> {
  try {
    return await db.entries.toArray();
  } catch (err) {
    console.error('Failed to list entries from IndexedDB:', err);
    return [];
  }
}

export async function getEntry(date: string): Promise<DayEntry | undefined> {
  try {
    return await db.entries.get(date);
  } catch (err) {
    console.error('Failed to get entry from IndexedDB:', err);
    return undefined;
  }
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
