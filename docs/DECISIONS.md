# Decision record

- **Cycles are derived, not stored.** A cycle runs from one period's start to
  the day before the next period's start (spec 6). Only periods, day entries,
  and settings live in IndexedDB.
- **Dates are stored as `YYYY-MM-DD`** and parsed with date-fns in the user's
  local timezone (spec 2.7). `createdAt`/`updatedAt` are full ISO 8601 strings.
- **No router dependency.** The four tabs are simple local state; deep links
  are not required for V1.
- **Dexie core `liveQuery`** is wrapped in a small React hook
  (`src/db/hooks.ts`) instead of adding the dexie-react-hooks package, keeping
  the dependency list to the stack named in the spec.
- **Prediction rounding.** The predicted cycle length (mean of the last up to
  6 completed cycles) is rounded to whole days so it can be added to a date.
  The range is mean ± max(2, round(standard deviation)), widened when the
  pattern is irregular (all constants in `src/logic/config.ts`).
- **Import semantics.** "Merge" upserts periods/entries and keeps current
  settings; "replace" also restores settings from the backup.
  TODO(spec): merge semantics for settings are not defined in the spec.
- **`settings.lastExportReminderAt`** is documented in SPEC.md section 6 and
  implements the export reminder cadence from spec 9.
- **Icons are SVG.** This text-only repo cannot carry binary PNGs; SVG icons
  with `sizes: "any"` satisfy installability in current browsers.
  TODO(spec): generate 192/512 PNG icons for the manifest.
- **Calendar week starts on Sunday** (date-fns default).
  TODO(spec): confirm whether a Monday start is wanted.
- **Manual pattern override** replaces only the displayed label; predictions
  always use the computed values (spec 4.3).
- **`ENABLED_LANGUAGES` build flag.** Languages other than English are gated behind `import.meta.env.VITE_ENABLE_ALL_LANGS === 'true'` at build time so unreviewed draft translations do not reach users in standard production builds.
- **Language names in native scripts.** Language display names (`LANGUAGE_NAMES`) are always presented in their own script (e.g., English, አማርኛ, العربية) and never translated, ensuring users can recognize their language regardless of the active UI locale.
