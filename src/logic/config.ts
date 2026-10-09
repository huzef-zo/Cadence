// All thresholds live here (spec section 7) so they can be reviewed and
// changed by a qualified clinician later. See CONTRIBUTING.md: these values
// need clinical review before changing. Do not scatter magic numbers.

// Typical cycle-length range (days, inclusive). Cycles shorter than MIN or
// longer than MAX are labeled "outside typical range".
export const CYCLE_LENGTH_MIN = 24;      // days
export const CYCLE_LENGTH_MAX = 38;      // days

// Largest allowed difference (days) between the shortest and longest of the
// most recent completed cycles for the overall pattern to be "regular".
export const MAX_VARIATION = 9;          // days

// Completed cycles required before an overall pattern label is shown.
export const MIN_CYCLES_FOR_PATTERN = 3; // completed cycles needed

// Number of most recent completed cycles used for the pattern label.
export const CYCLES_CONSIDERED = 6;      // most recent completed cycles

// Prediction (spec 7.4)
export const PREDICTION_MIN_COMPLETED_CYCLES = 2; // below this: no prediction unless an onboarding estimate exists
export const PREDICTION_CYCLES_CONSIDERED = 6;    // completed cycles averaged for the predicted length
export const PREDICTION_MIN_RANGE_DAYS = 2;       // range is mean ± max(this, round(standard deviation))
export const PREDICTION_ESTIMATE_RANGE_DAYS = 2;  // range when using the onboarding estimate
export const PREDICTION_IRREGULAR_MULTIPLIER = 2; // widens the range when the pattern is irregular
export const DEFAULT_PREDICTED_PERIOD_LENGTH = 5; // fallback when no past period lengths exist

// Day-entry note cap (spec 4.2).
export const NOTE_MAX_LENGTH = 500;

// Reminders (spec 4.7)
export const DEFAULT_DAYS_BEFORE = 2; // default "period expected soon" lead time
export const REMINDER_TICK_MS = 30_000; // how often the in-app reminder host checks

// App lock (spec 4.9)
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;
export const LOCK_BACKGROUND_MS = 60_000; // lock after 60 s in the background
export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_HASH = 'SHA-256';
export const PBKDF2_SALT_BYTES = 16;

// Export-backup reminder (spec 9)
export const EXPORT_REMINDER_AFTER_PERIODS = 3;   // show once after this many periods
export const EXPORT_REMINDER_INTERVAL_DAYS = 90;  // then re-show every N days
export const BACKUP_SCHEMA_VERSION = 1;
