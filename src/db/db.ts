import Dexie, { type Table } from 'dexie';
import { DEFAULT_DAYS_BEFORE } from '../logic/config';
import type { DayEntry, Period, Settings } from './types';

export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  key: 'main',
  language: 'system',
  regularityOverride: 'auto',
  typicalCycleLength: null,
  typicalPeriodLength: null,
  reminders: { periodSoon: true, daysBefore: DEFAULT_DAYS_BEFORE, dailyLog: false, dailyTime: null },
  theme: 'system',
  lockEnabled: false,
  lockHash: null,
  lockSalt: null,
  onboardingDone: false,
  schemaVersion: SCHEMA_VERSION,
  lastExportReminderAt: null,
};

export class CadenceDB extends Dexie {
  periods!: Table<Period, string>;
  entries!: Table<DayEntry, string>;
  settings!: Table<Settings, string>;

  constructor(name = 'cadence') {
    super(name);
    this.version(1).stores({
      periods: 'id, startDate',
      entries: 'date',
      settings: 'key',
    });
  }
}

export const db = new CadenceDB();
