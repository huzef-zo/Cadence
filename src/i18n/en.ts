// All user-facing text lives here (English only in V1, spec section 3).
// Layouts use logical CSS properties so RTL languages can be added later.

export const strings = {
  appName: 'Cadence',

  // Tabs
  tabToday: 'Today',
  tabCalendar: 'Calendar',
  tabHistory: 'History',
  tabSettings: 'Settings',

  // Generic
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  delete: 'Delete',
  edit: 'Edit',
  notAvailable: '—',

  // Required wording (spec section 9)
  disclaimer:
    'Cadence is a personal tracking tool. It does not provide medical advice, diagnosis, or treatment. Predictions are estimates. If something feels wrong, or your cycle changes suddenly, talk to a qualified health professional.',
  privacyStatement:
    'Your data stays on this device. Cadence has no accounts, no servers, and no tracking. Export backups regularly, because clearing your browser data or uninstalling the app can erase your history.',

  // Onboarding
  onboardingStep1Title: 'Welcome to Cadence',
  onboardingStep1Body:
    'Cadence is a private period and cycle tracker. Everything you log stays on this device: no account, no server, no tracking.',
  onboardingStep2Title: 'Optional starting point',
  onboardingStep2Body:
    'You can add when your last period started and your typical cycle and period lengths. These are used only until you have logged real data.',
  onboardingLastPeriodStart: 'Last period start date (optional)',
  onboardingTypicalCycleLength: 'Typical cycle length, in days (optional)',
  onboardingTypicalPeriodLength: 'Typical period length, in days (optional)',
  onboardingInvalidNumber: 'Please enter a positive number of days, or leave the field empty.',
  onboardingStep3Title: 'Before you start',
  onboardingAcknowledge: 'I understand',
  onboardingNext: 'Next',
  onboardingBack: 'Back',

  // Today
  statusNoData: 'Log your first period to start tracking.',
  statusPeriodDay: (n: number) => `Period day ${n}`,
  statusCycleDay: (n: number) => `Day ${n} of your cycle`,
  predictionNeedCycles: 'Log at least 2 cycles to see predictions.',
  predictionRange: (start: string, end: string) => `Next period: around ${start} to ${end}`,
  predictionEstimateNote: 'Predictions are estimates.',
  predictionBasedOnEstimate: 'Based on the typical length you entered during onboarding, not on logged cycles yet.',
  predictionIrregularNote: 'Your pattern is irregular, so this prediction is less reliable.',
  patternRegular: 'Regular pattern',
  patternIrregular: 'Irregular pattern',
  patternNotEnoughData: 'Not enough data yet',
  patternExplanationTitle: 'How this was decided',
  patternExplanation: (min: number, max: number, variation: number, minCycles: number) =>
    `This label describes your logged cycles. A cycle length between ${min} and ${max} days counts as within the typical range. If the difference between your shortest and longest recent cycles is ${variation} days or less, and all recent cycles are within that range, the pattern is called regular; otherwise irregular. Before ${minCycles} completed cycles, it says “Not enough data yet”. This is not a medical assessment.`,
  actionPeriodStarted: 'Period started today',
  actionPeriodEnded: 'Period ended today',
  actionLogToday: 'Log today',
  managePeriods: 'Add or edit past periods',
  todayEntryTitle: "Today's log",
  exportReminderTitle: 'Time to export a backup',
  exportReminderBody:
    'Your history lives only on this device. Export a backup file so you can restore it if this browser data is ever cleared.',
  exportReminderAction: 'Export backup',
  exportReminderDismiss: 'Dismiss',

  // Period errors
  errorEndBeforeStart: 'End date cannot be before start date.',
  errorPeriodOverlap: 'Periods cannot overlap.',

  // Periods sheet
  periodsTitle: 'Periods',
  addPeriod: 'Add a period',
  editPeriod: 'Edit period',
  periodStartLabel: 'Start date',
  periodEndLabel: 'End date (leave empty while ongoing)',
  periodOngoing: 'Ongoing',
  deletePeriodConfirm: 'Delete this period?',
  noPeriods: 'No periods logged yet.',

  // Cycle labels
  cycleWithinRange: 'Within typical range',
  cycleOutsideRange: 'Outside typical range',
  noteShort: 'Shorter than the typical range.',
  noteLong: 'Longer than the typical range.',

  // Calendar
  calendarPrevMonth: 'Previous month',
  calendarNextMonth: 'Next month',
  weekdayShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  legendPeriod: 'Period',
  legendPredicted: 'Predicted period days',
  legendLogged: 'Has a log entry',
  legendToday: 'Today',

  // Log sheet
  logTitle: (date: string) => `Log for ${date}`,
  logFlow: 'Flow',
  flowNone: 'None',
  flowSpotting: 'Spotting',
  flowLight: 'Light',
  flowMedium: 'Medium',
  flowHeavy: 'Heavy',
  logMood: 'Mood',
  logPain: 'Pain level',
  painRecord: 'Record a pain level',
  painValue: (n: number) => `${n} of 10`,
  painTagsLabel: 'Where is the pain?',
  symptomsLabel: 'Symptoms',
  moodTagsLabel: 'Mood tags',
  logNote: 'Note',
  logNotePlaceholder: 'Anything you want to remember about this day (optional)',
  noteRemaining: (n: number) => `${n} characters left`,
  fieldNotSet: 'Not set',

  // History
  noCycles: 'No cycles logged yet.',
  noEntries: 'No day entries in this cycle.',
  summaryAvgCycleLength: 'Average cycle length',
  summaryAvgPeriodLength: 'Average period length',
  summaryCyclesLogged: 'Cycles logged',
  days: (n: number) => `${n} days`,
  cardPeriodLength: 'Period length',
  cardCycleLength: 'Cycle length',
  cardAvgPain: 'Average pain',
  cardMoodFrequency: 'Most frequent mood',

  // Settings
  sectionPattern: 'Cycle pattern',
  overrideLabel: 'Overall pattern label',
  overrideAuto: 'Auto (calculated)',
  overrideRegular: 'Regular',
  overrideIrregular: 'Irregular',
  overrideHint: 'A manual override changes the label shown. Predictions are calculated the same way either way.',
  sectionReminders: 'Reminders',
  remindersUnsupported: 'This device or browser does not support notifications, so reminders are unavailable.',
  remindersPermissionNeeded: 'Notifications are turned off for this site in your browser settings, so reminders cannot be shown.',
  periodSoonToggle: 'Notify me before my period is expected',
  daysBeforeLabel: 'Days before the predicted start',
  dailyLogToggle: 'Daily reminder to log',
  dailyTimeLabel: 'Daily reminder time',
  reminderPeriodSoonTitle: 'Cadence',
  reminderPeriodSoonBody: 'Your period may start soon. This is only an estimate.',
  reminderDailyLogTitle: 'Cadence',
  reminderDailyLogBody: 'Time to log how you feel today.',
  sectionLock: 'App lock',
  lockWarning:
    'If you forget this PIN, the only way back into the app is to delete all of your data, unless you have an export file. Choose a PIN you will remember.',
  lockPinLabel: 'PIN (4 to 6 digits)',
  lockConfirmLabel: 'Confirm PIN',
  lockSaved: 'App lock is on.',
  lockInvalid: 'The PIN must be 4 to 6 digits.',
  lockMismatch: 'The PINs do not match.',
  lockDisable: 'Turn off app lock',
  lockDisableConfirm: 'Turn off the app lock?',
  lockTitle: 'Enter your PIN',
  lockUnlock: 'Unlock',
  lockWrong: 'Incorrect PIN. Try again.',
  sectionTheme: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  sectionData: 'Your data',
  dataExport: 'Export backup (JSON)',
  dataExportDone: 'Backup downloaded.',
  dataImport: 'Import backup',
  dataImportInvalid: 'That file is not a valid Cadence backup.',
  dataImportMerge: 'Merge with current data',
  dataImportReplace: 'Replace all current data',
  dataImportReplaceConfirm: 'Replace all data currently on this device with the backup?',
  dataImportResult: (periods: number, entries: number) => `Imported ${periods} periods and ${entries} day entries.`,
  dataDelete: 'Delete all data',
  dataDeleteWarning:
    'This permanently deletes every period, day entry, and setting on this device. This cannot be undone. Consider exporting a backup first.',
  dataDeleteTypeLabel: 'Type DELETE to confirm',
  dataDeleteButton: 'Delete everything',
  shareSummary: 'Download cycle summary (CSV)',
  sectionAbout: 'About',
  aboutVersion: 'Version',
  aboutLicense: 'License',
  aboutLicenseValue: 'MIT',
  aboutSource: 'Source code',
  // TODO(spec): replace with the real repository URL once the repo exists.
  sourceRepoUrl: 'https://github.com/cadence-tracker/cadence',

  // PWA update prompt
  updateAvailable: 'Update available',
  updateReload: 'Reload to update',
};

export const flowLabels: Record<'none' | 'spotting' | 'light' | 'medium' | 'heavy', string> = {
  none: strings.flowNone,
  spotting: strings.flowSpotting,
  light: strings.flowLight,
  medium: strings.flowMedium,
  heavy: strings.flowHeavy,
};

export const moodLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: strings.moodVeryLow,
  2: strings.moodLow,
  3: strings.moodNeutral,
  4: strings.moodGood,
  5: strings.moodGreat,
};

// Canonical tag ids are stored in the database; labels come from here.
export const moodTagKeys = ['calm', 'anxious', 'irritable', 'sad', 'energetic', 'tired'] as const;
export const painTagKeys = ['cramps', 'lower-back', 'headache', 'breast-tenderness', 'other'] as const;
export const symptomKeys = ['bloating', 'acne', 'nausea', 'cravings', 'poor-sleep', 'low-energy', 'dizziness'] as const;

export const tagLabels: Record<string, string> = {
  calm: strings.tagCalm,
  anxious: strings.tagAnxious,
  irritable: strings.tagIrritable,
  sad: strings.tagSad,
  energetic: strings.tagEnergetic,
  tired: strings.tagTired,
  cramps: strings.painTagCramps,
  'lower-back': strings.painTagLowerBack,
  headache: strings.painTagHeadache,
  'breast-tenderness': strings.painTagBreastTenderness,
  other: strings.painTagOther,
  bloating: strings.symptomBloating,
  acne: strings.symptomAcne,
  nausea: strings.symptomNausea,
  cravings: strings.symptomCravings,
  'poor-sleep': strings.symptomPoorSleep,
  'low-energy': strings.symptomLowEnergy,
  dizziness: strings.symptomDizziness,
};
