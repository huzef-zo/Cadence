# Cadence — V2 Specification

> **Instructions for Jules (or any AI coding agent):**
> 1. Read `SPEC.md` first. Everything in it still applies, especially section 2
>    (hard constraints): local-only data, no network calls, no analytics, no
>    medical advice, accessible, mobile-first.
> 2. Then read this file. It extends `SPEC.md`; where they conflict, this file wins.
> 3. Work in the phase order below. **One focused pull request per numbered
>    task.** Use conventional commits.
> 4. Before every PR run `npm run lint`, `npm test`, `npm run build`. All must pass.
> 5. Do not change any value in `src/logic/config.ts` (clinical thresholds).
> 6. All user-facing text goes through `src/i18n`. No hardcoded strings in components.
> 7. Do not add runtime dependencies. Dev-only dependencies are allowed where a
>    task says so. If something is ambiguous, pick the simplest option and leave
>    `// TODO(spec): <question>`.
> 8. Record non-obvious decisions in `docs/DECISIONS.md`.

---

## Phase 0 — V1 cleanup (do first, small PRs)

0.1 **README:** the code block under "Development" is not closed. Close it, and
add the "How to contribute" section required by SPEC section 10. Add a short
"Known limitations" section: (a) app lock only hides the interface, data in
IndexedDB is not encrypted; (b) reminders only fire while the app is open.

0.2 **CONTRIBUTING.md:** remove the stray ```` ```md ```` fence and the bold
filename line at the top of the file.

0.3 **Icons:** no action. The SVG icons were tested and the app installs
correctly on Android. Leave the manifest as is. (Optionally reword the related
`TODO(spec)` comment to say PNG icons are not needed.)

0.4 **Backup download on mobile:** in `src/db/backup.ts`, `downloadText` revokes
the object URL immediately, which can break the download in some mobile
browsers. Revoke after a short `setTimeout`.

0.5 **Backup validation:** `validateBackup` only checks that `periods` and
`entries` are arrays. Also validate each item's shape (`id`, `startDate`,
`YYYY-MM-DD` format, `flow` and `mood` in allowed values, `pain` 0–10, note
length 500). Reject the whole file if any item is invalid. On "replace" import,
if the backup has no `main` settings row, write `DEFAULT_SETTINGS` with
`onboardingDone: true` instead of leaving no settings. Add tests.

0.6 **Today screen after midnight:** in `src/screens/Today.tsx` the "today's
entry" query is created once, so it goes stale after midnight while the app
stays open. Make `day` update (for example on `visibilitychange` and a
minute-interval check) and have the query depend on it.

0.7 **Late period note:** if there is no ongoing period and the predicted range
has fully passed, show a neutral line on the Today screen: "The predicted range
has passed. Log your period start when it begins." No medical wording.

0.8 **SPEC.md data model:** add `lastExportReminderAt` (and, later, the new V2
settings fields) to the `Settings` interface in `SPEC.md` section 6 so the spec
matches the code.

---

## Phase 1 — Insights (V1.1)

Purpose: help the user see their own patterns. **Descriptive only.** Never
interpret results medically, never use "normal"/"abnormal", never suggest
causes or treatments.

**Where:** inside the History tab, add a segmented control: **Cycles | Insights**.
Keep the bottom bar at 4 tabs.

**Content (Insights view):**
1. **Cycle length trend:** last 12 completed cycles as a simple line/bar chart.
2. **Period length trend:** same, for period length.
3. **Pain across the cycle:** average pain (0–10) by cycle day.
4. **Mood across the cycle:** average mood (1–5) by cycle day.
5. **Top symptoms:** the 5 most frequently logged symptoms with counts.
6. **Flow distribution:** how many logged days were spotting/light/medium/heavy.
7. A one-line summary at top: average cycle length ± range, from completed cycles.

**Rules:**
- Pure functions in `src/logic/insights.ts`, fully unit tested. Components only
  render.
- Cycle-day index = days since the cycle's start date + 1. Use completed cycles
  only. Show the by-cycle-day charts only when at least 2 completed cycles have
  entries; otherwise show "Keep logging to see this."
- Non-clinical constants (max cycle days shown, minimum cycles, trend length)
  live in a new `src/logic/insights-config.ts`, not in `config.ts`.
- **No chart library.** Draw charts as inline SVG using CSS variables from
  `tokens.css` (no hardcoded colors). Do not rely on color alone: use shapes
  or labels.
- **Accessibility:** every chart has a text alternative: a `<details>` element
  containing a data table with the same numbers, plus a short `aria-label`.
- All text via i18n. Respect `prefers-reduced-motion` (no animated charts).

---

## Phase 2 — Amharic and Arabic with RTL

**Languages:** English (`en`), Amharic (`am`), Arabic (`ar`).

**Important finding about the current code:** components read
`strings` from `src/i18n/en.ts` at module load, and several files build
constants at module level from it (`FLOW_OPTIONS` in `LogSheet.tsx`,
`MOOD_OPTIONS` in `MoodPicker.tsx`, `TABS` in `TabBar.tsx`, `PATTERN_TEXT` in
`Today.tsx`). Those cannot change language at runtime. The refactor is the
first task.

2.1 **i18n infrastructure.**
- Create `src/i18n/index.ts` with an I18n React context, a `useI18n()` hook
  returning `{ t, lang, dir, formatDay, formatMonth, weekdayShort, plural }`,
  and a provider mounted in `main.tsx`.
- `en.ts` stays the source of truth. `am.ts` and `ar.ts` are typed as the same
  shape as `en.ts` so `tsc` fails if a key is missing.
- Move all module-level constants that use strings inside components (or into
  functions that take `t`).
- Move `flowLabels`, `moodLabels`, `tagLabels` into each language file.
- Stored values (tag ids, flow values) never change. Only labels are translated.

2.2 **Language setting.** Add `language: 'system' | 'en' | 'am' | 'ar'` to
`Settings` (default `'system'`, resolved from `navigator.language`, fallback
`en`). Add Settings > Language. Also show a language picker on onboarding
step 1. Update `<html lang>` and `<html dir>` when the language changes.
Language names are shown in their own script: English, አማርኛ, العربية.

2.3 **Dates, numbers, plurals.**
- Replace `date-fns` `format` for display with `Intl.DateTimeFormat` using the
  active locale (date-fns has no Amharic locale). Keep `date-fns` for date math
  and keep storage as `YYYY-MM-DD`.
- Calendar weekday headers and month names come from `Intl`.
- Use Latin digits (`nu-latn`) in all languages for now.
- `strings.days(n)` and `strings.noteRemaining(n)` must use
  `Intl.PluralRules` (Arabic has several plural forms). Add tests.
- Calendar week start: add a Settings option "Week starts on: Sunday / Monday /
  Saturday". Default Sunday for `en` and `am`, Saturday for `ar`.

2.4 **RTL layout audit.**
- Use logical CSS properties everywhere in `global.css`; fix any remaining
  physical `left/right/margin-left/padding-right` usage.
- Mirror directional glyphs: the calendar `‹ ›` buttons, and the close button
  position in `Sheet`.
- The `.input--pin` PIN field and any number inputs stay left-to-right
  (`dir="ltr"`).
- The delete confirmation word stays the Latin text `DELETE` in every language;
  show it in an `ltr` span.
- Check every screen at 360px width in both directions.

2.4b **Fonts.** No external fonts (no network). Use system fonts. Add a
Ge'ez-capable fallback to the font stack in `tokens.css` (for example
`'Noto Sans Ethiopic'`). Do not bundle fonts in this phase.

2.5 **Translations.** Jules may draft `am.ts` and `ar.ts`. Mark both files with
a header comment: `// DRAFT: must be reviewed by a native speaker before release`.
Use simple, plain words. The disclaimer and privacy statement must keep the
exact meaning of the English text. Create `docs/TRANSLATING.md` explaining how to
add or review a language.

2.6 **Tests.** Plural rules, language resolution from `navigator.language`,
and a test that every key in `en.ts` exists in `am.ts` and `ar.ts`.

---

## Phase 3 — Printable doctor summary

Replaces the CSV-only "share summary" with a printable view. The CSV stays.

3.1 Settings > Your data > **"Print or save summary as PDF"** opens a sheet with
options: range (last 3 / 6 / 12 cycles / all), and toggles for *include daily
logs* (default off) and *include notes* (default **off**, for privacy).
3.2 A dedicated print view shows: date generated, range, average cycle and
period length, a table of cycles (start, end, period length, cycle length,
label), optional daily logs, and the disclaimer from `SPEC.md` section 9.
3.3 Output uses `window.print()` and an `@media print` stylesheet. **No PDF
library.** Black on white, no backgrounds required, works in RTL, page breaks
avoid splitting a table row.
3.4 All wording via i18n and neutral. No interpretation of the data.

---

## Phase 4 — Ethiopian calendar display (do NOT start until the owner approves)

Only begin this phase if the repository owner has labeled the issue
`approved`. If not approved, skip it.

- Settings > Calendar system: Gregorian / Ethiopian. Display only.
- Storage stays Gregorian `YYYY-MM-DD` (SPEC section 2.7). Never store Ethiopian
  dates.
- Ethiopian months are 12 months of 30 days plus Pagume (5 or 6 days). The
  calendar grid and all date labels must follow the chosen system.
- Use `Intl.DateTimeFormat` with the `ethiopic` calendar for labels, and write a
  small pure conversion helper for the month grid. **Unit-test the helper against
  `Intl.DateTimeFormat` output** across a range of dates, including Pagume and
  leap years. Do not hardcode expected values from memory.

---

## Out of scope for V2 (do NOT build)

Fertile window or ovulation prediction, contraceptive-method modules,
medication or treatment suggestions, accounts, cloud sync, social features, AI
chat, advertising, analytics, any new network request at runtime, any UI
component or chart library.

---

## Definition of done for V2

- Phases 0–3 merged (Phase 4 only if approved).
- App works offline and fully in English, Amharic, and Arabic, with correct RTL.
- All tests, lint, and build pass in CI.
- `README.md` feature list, `SPEC.md` data model, and `docs/DECISIONS.md` are
  updated. `package.json` version set to `2.0.0`.
- Backup `schemaVersion` stays `1`: new settings fields are optional and
  filled from defaults by `getSettings`.
