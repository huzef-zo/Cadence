# Cadence — V1 Specification

> **Instructions for any AI coding agent (z.ai, Jules, or other):**
> Read this entire file before writing code. Follow it exactly. If something is
> ambiguous, choose the simplest option that satisfies this spec and leave a
> `// TODO(spec): <question>` comment. Do not add features that are not listed
> here. Do not add any network calls, analytics, or third-party trackers.

---

## 1. What Cadence is

Cadence is a privacy-first period and cycle tracker built as a **Progressive Web
App (PWA)**. All data is stored **only on the user's device**. There is no
backend, no account, and no login. The project is **open source** (MIT).

Primary users: people tracking their cycle on a phone, often on slow or
offline connections. The app is **mobile-first**.

---

## 2. Hard constraints

1. **Local-only data.** Everything lives in IndexedDB. No server, no cloud sync,
   no analytics, no external API calls at runtime.
2. **Offline-first.** After first load, the whole app works with no connection.
3. **Mobile-first.** Design for 360px width first. Touch targets at least 44px.
4. **No medical advice.** The app records and summarizes the user's own data. It
   never diagnoses, never tells the user what to take, and never claims a
   result is "normal" or "abnormal" medically. Use neutral wording such as
   "regular pattern" / "irregular pattern" and always show the disclaimer in
   section 9.
5. **Privacy by default.** No data leaves the device unless the user manually
   exports it.
6. **Accessible.** Target WCAG 2.1 AA: labels on all inputs, sufficient
   contrast, never use color alone to convey meaning, respect
   `prefers-reduced-motion`.
7. **Dates.** Store all dates as ISO 8601 strings. Day-level data uses
   `YYYY-MM-DD` in the user's local timezone. Never store ambiguous formats.

---

## 3. Tech stack

Use this unless there is a strong reason not to:

- **Vite** + **React** + **TypeScript**
- **Dexie** (IndexedDB wrapper) for storage
- **vite-plugin-pwa** for the service worker and manifest
- **date-fns** for date math
- Plain CSS with **CSS variables for all design tokens** (colors, spacing,
  radius, font sizes) in a single `tokens.css` file. The final UI will be
  designed separately and applied by editing tokens and components, so keep
  styling clean and centralized. Do not hardcode colors in components.
- **Vitest** for unit tests on the logic in section 7.
- No UI component library. No CSS framework.

Folder structure:

```
src/
  db/           # Dexie schema, queries
  logic/        # pure functions: cycles, regularity, prediction (unit tested)
  screens/      # Today, Calendar, History, Settings
  components/   # LogSheet, DayCell, PainSlider, MoodPicker, etc.
  styles/       # tokens.css, global.css
  i18n/         # strings (English only in V1, but all text goes through here)
```

All user-facing text must come from `src/i18n/en.ts` so translations
(Amharic, Arabic) can be added later. Design layouts so right-to-left
languages will not break them (use logical CSS properties such as
`margin-inline-start`).

---

## 4. Features (V1 scope)

### 4.1 Period start/end documentation
- User can log a **period start date** and **period end date**.
- A period is a record: `startDate`, optional `endDate` (null while ongoing).
- Quick action on Today screen: "Period started today" and, when a period is
  ongoing, "Period ended today".
- User can also add or edit a period for any past date manually.
- Validate: end date cannot be before start date; periods cannot overlap.
- Editing and deleting past periods is allowed (with delete confirmation).

### 4.2 Daily log (flow, mood, pain, symptoms, notes)
A **day entry** can be created for any date. All fields are optional.

- **Flow:** none / spotting / light / medium / heavy
- **Mood:** one of 5 levels (very low, low, neutral, good, great) plus optional
  tags: calm, anxious, irritable, sad, energetic, tired
- **Pain level:** integer 0–10 (slider) plus optional location tags: cramps,
  lower back, headache, breast tenderness, other
- **Symptoms (tags):** bloating, acne, nausea, cravings, poor sleep, low
  energy, dizziness
- **Note:** free text, max 500 characters

Logging UI is a bottom sheet (`LogSheet`) opened from the Today screen and
from tapping any day in the Calendar.

### 4.3 Regular / irregular categories
- Each **completed cycle** is automatically labeled (see section 7.3).
- The user's overall pattern is labeled **Regular**, **Irregular**, or
  **Not enough data yet**.
- The user may **manually override** the overall label in Settings
  (Auto / Regular / Irregular). Manual override only changes the label shown;
  predictions still use the logic in section 7.
- Tapping the label opens a plain-language explanation of how it was decided.

### 4.4 Calendar
- Month view, swipe or buttons to change months.
- Days show: period days (filled), predicted period days (outlined), days with
  a log entry (small dot), today (ring).
- Every marker must also have a non-color cue (shape, pattern, or icon) and an
  accessible label.
- Tap a day to open the LogSheet for that date.

### 4.5 History
- List of past cycles, newest first. Each card shows: start date, end date,
  period length (days), cycle length (days), regular/irregular label for that
  cycle, average pain, most frequent mood.
- Tap a cycle to see its daily entries.
- Simple summary at top: average cycle length, average period length, number of
  cycles logged.

### 4.6 Today screen
- Large status: "Day N of your cycle", or "Period day N" while ongoing.
- Next predicted period shown as a **date range** (see 7.4), or "Log at least
  2 cycles to see predictions".
- Quick actions: Start/End period, Log today.
- Today's logged entry summary if one exists.

### 4.7 Reminders (best effort)
- Optional local notifications: "period expected soon" (default 2 days before
  the predicted start) and an optional daily "log today" reminder at a
  user-chosen time.
- Use the Notifications API when available. If unsupported (for example some
  iOS versions), hide the feature gracefully and show a short note. Never
  require it.

### 4.8 Export / import / delete
- **Export:** download all data as a single `cadence-backup-YYYY-MM-DD.json`
  file.
- **Import:** restore from that JSON file. Validate schema and version. Ask
  whether to merge or replace.
- **Delete all data:** clear IndexedDB after a typed confirmation
  (user types "DELETE").
- **Optional:** "Share summary" that generates a simple printable/CSV summary
  of cycles for a doctor visit.

### 4.9 App lock (optional setting)
- User can set a 4–6 digit PIN. Store only a salted hash (Web Crypto
  PBKDF2). Lock on app open and after 60 seconds in the background.
- Include a clear warning: forgetting the PIN requires deleting the data
  unless the user has an export.

### 4.10 Settings
- Manual regular/irregular override
- Reminders
- App lock
- Theme: system / light / dark
- Export / import / delete
- About: version, license, link to source repository, privacy statement

### Out of scope for V1 (do NOT build)
Fertile window or ovulation prediction, contraceptive-method modules,
medication or treatment suggestions, accounts, cloud sync, social features,
AI chat, advertising, analytics, languages other than English.

---

## 5. Screens and navigation

Bottom tab bar with 4 tabs: **Today · Calendar · History · Settings**.

First launch shows a short onboarding (max 3 steps):
1. What Cadence is, and that data stays on the device.
2. Optional: date of last period start, and typical cycle and period length
   (used only until the user has real data).
3. Disclaimer acknowledgment.

Placeholder visuals are fine. The final design will replace styling, so keep
components small and presentational and keep logic out of them.

---

## 6. Data model (Dexie / IndexedDB)

```ts
// Table: periods
interface Period {
  id: string;            // uuid
  startDate: string;     // YYYY-MM-DD
  endDate: string | null;// YYYY-MM-DD, null if ongoing
  createdAt: string;     // ISO 8601 with offset
  updatedAt: string;     // ISO 8601 with offset
}

// Table: entries  (one per date)
interface DayEntry {
  date: string;          // YYYY-MM-DD (primary key)
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | null;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  moodTags: string[];
  pain: number | null;   // 0-10
  painTags: string[];
  symptoms: string[];
  note: string;          // max 500 chars
  updatedAt: string;
}

// Table: settings (single row, key = 'main')
interface Settings {
  key: 'main';
  regularityOverride: 'auto' | 'regular' | 'irregular';
  typicalCycleLength: number | null;   // onboarding estimate
  typicalPeriodLength: number | null;
  reminders: { periodSoon: boolean; daysBefore: number; dailyLog: boolean; dailyTime: string | null };
  theme: 'system' | 'light' | 'dark';
  lockEnabled: boolean;
  lockHash: string | null;
  lockSalt: string | null;
  onboardingDone: boolean;
  schemaVersion: number;
  lastExportReminderAt: string | null; // YYYY-MM-DD, when the export reminder was last shown or dismissed
}

New settings fields must be optional in backups and filled from defaults by getSettings, so older backups keep working.
```

Backup file format:

```json
{ "app": "cadence", "schemaVersion": 1, "exportedAt": "<ISO 8601>", "periods": [], "entries": [], "settings": {} }
```

Cycles are **derived**, not stored: a cycle runs from one period's `startDate`
to the day before the next period's `startDate`.

---

## 7. Logic rules (pure functions in `src/logic/`, unit tested)

All thresholds live in **one file**: `src/logic/config.ts`, as named constants
with comments, so they can be reviewed and changed by a qualified clinician
later. Do not scatter magic numbers.

### 7.1 Cycle length
`cycleLength = days between start of this period and start of the next period`.
The most recent (ongoing) cycle has no length yet.

### 7.2 Period length
`periodLength = endDate - startDate + 1` (inclusive), for periods with an end
date.

### 7.3 Regular / irregular
Default constants (editable in config):

```ts
export const CYCLE_LENGTH_MIN = 24;      // days
export const CYCLE_LENGTH_MAX = 38;      // days
export const MAX_VARIATION = 9;          // days between shortest and longest
export const MIN_CYCLES_FOR_PATTERN = 3; // completed cycles needed
export const CYCLES_CONSIDERED = 6;      // most recent completed cycles used
```

- **Single cycle label:** "within typical range" if
  `CYCLE_LENGTH_MIN <= length <= CYCLE_LENGTH_MAX`, otherwise "outside typical
  range". Show these neutral labels with the short/long note, not
  "abnormal".
- **Overall pattern:**
  - fewer than `MIN_CYCLES_FOR_PATTERN` completed cycles → **Not enough data yet**
  - else take the last `CYCLES_CONSIDERED` completed cycles; if
    `max - min <= MAX_VARIATION` **and** every cycle is within the typical range
    → **Regular**
  - otherwise → **Irregular**
- Manual override (4.3) replaces the displayed label only.

### 7.4 Prediction (next period)
- Requires at least 2 completed cycles; otherwise show no prediction (or use
  the onboarding typical cycle length, clearly marked as "based on your
  estimate").
- Predicted cycle length = mean of the last up to 6 completed cycle lengths.
- Predicted start date = last period start + predicted length.
- Show as a **range**, not a single day: `mean ± max(2, round(standardDeviation))`
  days. If the pattern is Irregular, widen the range and show a note that
  predictions are less reliable.
- Always label predictions as **estimates**.
- Predicted period length = mean of past period lengths (fallback 5).

### 7.5 Tests required
Unit tests for: cycle derivation, inclusive period length, overlap validation,
regular vs irregular boundaries (exactly at the thresholds), prediction range,
and import/export round trip.

---

## 8. PWA requirements

- `manifest.webmanifest`: name "Cadence", short_name "Cadence", standalone
  display, theme and background colors from tokens, icons 192 and 512 (plus
  maskable).
- Service worker precaches the app shell; app works fully offline.
- Show an "Update available" prompt when a new version is ready.
- Neutral, discreet app icon and name (no explicit imagery) so the app is
  private on a shared phone.
- Lighthouse targets: PWA installable, Performance 90+, Accessibility 95+.

---

## 9. Required wording

Show this disclaimer during onboarding and in Settings > About:

> Cadence is a personal tracking tool. It does not provide medical advice,
> diagnosis, or treatment. Predictions are estimates. If something feels wrong,
> or your cycle changes suddenly, talk to a qualified health professional.

Privacy statement for About:

> Your data stays on this device. Cadence has no accounts, no servers, and no
> tracking. Export backups regularly, because clearing your browser data or
> uninstalling the app can erase your history.

Show a one-time reminder to export a backup after the user has logged 3
periods, then every 90 days.

---

## 10. Repository requirements

- `README.md`: what it is, privacy promise, screenshots placeholder, how to
  run, build, and test, how to contribute.
- `LICENSE`: MIT.
- `CONTRIBUTING.md`: short; note that medical thresholds in `config.ts` need
  clinical review before changing.
- `docs/DECISIONS.md`: record of key decisions.
- Conventional commits. Small, focused pull requests.
- GitHub Actions workflow: install, lint, test, build on every PR.

---

## 11. Build order (for the first agent)

1. Project setup, tokens, folder structure, PWA config.
2. `src/logic/` with full unit tests (section 7). Get these passing first.
3. Dexie schema and queries.
4. Today screen and period start/end quick actions.
5. LogSheet (flow, mood, pain, symptoms, note).
6. Calendar.
7. History.
8. Settings: override, theme, export/import/delete.
9. Onboarding.
10. Reminders, then app lock.
11. README, LICENSE, CONTRIBUTING, CI.

**Definition of done for V1:** all features in section 4 work offline on a
360px-wide viewport, tests pass, build succeeds, and no network requests
occur at runtime other than loading the app itself.

---

## 12. Roadmap (not for the first agent)

- V1.1: Insights (cycle trends, mood/pain across the cycle).
- V2: Amharic and Arabic (with RTL), PDF export for doctor visits.
- Later, only after review by qualified clinicians: method-specific modules
  (for example, contraceptive bleeding patterns).
