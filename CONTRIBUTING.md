
**`CONTRIBUTING.md`**
```md
# Contributing

Thank you for helping with Cadence!

- Keep pull requests small and focused, and use conventional commits
  (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- Run `npm run lint`, `npm test`, and `npm run build` before opening a PR.
  CI runs the same checks on every pull request.
- All user-facing text must come from `src/i18n/en.ts`.
- Do not add network calls, analytics, or third-party trackers. Data must
  stay on the device.

## Medical thresholds

The constants in `src/logic/config.ts` (typical cycle-length range, variation
limit, prediction settings) are clinical values. They need review by a
qualified clinician before any change, so please open an issue first if your
PR would modify that file.
