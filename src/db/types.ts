export type Flow = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface Period {
  id: string;             // uuid
  startDate: string;      // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD, null if ongoing
  createdAt: string;      // ISO 8601 with offset
  updatedAt: string;      // ISO 8601 with offset
}

export interface DayEntry {
  date: string;          // YYYY-MM-DD (primary key)
  flow: Flow | null;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  moodTags: string[];
  pain: number | null;   // 0-10
  painTags: string[];
  symptoms: string[];
  note: string;          // max 500 chars
  updatedAt: string;
}

export interface ReminderSettings {
  periodSoon: boolean;
  daysBefore: number;
  dailyLog: boolean;
  dailyTime: string | null;
}

export interface Settings {
  key: 'main';
  language: 'system' | 'en' | 'am' | 'ar';
  regularityOverride: 'auto' | 'regular' | 'irregular';
  typicalCycleLength: number | null;
  typicalPeriodLength: number | null;
  reminders: ReminderSettings;
  theme: 'system' | 'light' | 'dark';
  lockEnabled: boolean;
  lockHash: string | null;
  lockSalt: string | null;
  onboardingDone: boolean;
  schemaVersion: number;
  // TODO(spec): section 9 requires an export reminder after 3 periods and
  // every 90 days, but the data model in section 6 has no field recording
  // when the user last saw it. Added this minimal field to implement it.
  lastExportReminderAt: string | null; // YYYY-MM-DD
}
