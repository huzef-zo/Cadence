# Cadence

Cadence is a privacy-first period and cycle tracker that runs entirely on your
device as a Progressive Web App (PWA). There is no account, no server, no
analytics, and no tracking: all data lives in your browser's IndexedDB and
never leaves your phone unless you explicitly export a backup.

> Cadence is a personal tracking tool. It does not provide medical advice,
> diagnosis, or treatment. Predictions are estimates. If something feels wrong,
> or your cycle changes suddenly, talk to a qualified health professional.

## Privacy promise

Your data stays on this device. Cadence has no accounts, no servers, and no
tracking. Export backups regularly, because clearing your browser data or
uninstalling the app can erase your history.

## Screenshots

<!-- TODO: add screenshots here. -->

## Features (V1)

- Period start/end logging with quick actions, plus manual add/edit/delete for past dates
- Daily log: flow, mood, pain, symptoms, notes
- Regular / irregular pattern label with a plain-language explanation
- Month calendar with period, prediction, log and today markers (shape cues + labels)
- History of past cycles with averages
- Optional local reminders and optional PIN app lock
- Export / import backups (JSON), delete all data, CSV cycle summary
- Works fully offline after the first load

## Development

Requirements: Node.js 20+.

```bash
npm install
npm run dev      # start the dev server
npm test         # run the unit tests (Vitest)
npm run lint     # type-check
npm run build    # production build (outputs dist/)
npm run preview  # preview the production build
