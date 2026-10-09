import { useState } from 'react';
import { strings } from '../i18n/en';
import { db } from '../db/db';
import { useLiveQuery, useToday } from '../db/hooks';
import { getSettings, saveSettings, createPeriod, updatePeriod } from '../db/queries';
import { exportBackup } from '../db/backup';
import { LogSheet } from '../components/LogSheet';
import { PeriodSheet } from '../components/PeriodSheet';
import { entrySummaryLines } from '../components/EntrySummary';
import {
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  EXPORT_REMINDER_AFTER_PERIODS,
  EXPORT_REMINDER_INTERVAL_DAYS,
  MAX_VARIATION,
  MIN_CYCLES_FOR_PATTERN,
} from '../logic/config';
import { deriveCycles } from '../logic/cycles';
import { diffDays, formatDayLong } from '../logic/dates';
import { isPredictionPassed, predictNextPeriod } from '../logic/prediction';
import { displayedPatternLabel, overallPatternLabel, type PatternLabel } from '../logic/regularity';
import { validatePeriod } from '../logic/validation';

const PATTERN_TEXT: Record<PatternLabel, string> = {
  regular: strings.patternRegular,
  irregular: strings.patternIrregular,
  'not-enough-data': strings.patternNotEnoughData,
};

export function Today() {
  const day = useToday();
  const settings = useLiveQuery(() => getSettings(), []);
  const periods = useLiveQuery(() => db.periods.toArray(), []);
  const entry = useLiveQuery(() => db.entries.get(day), [day]);
  const [logOpen, setLogOpen] = useState(false);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatternInfo, setShowPatternInfo] = useState(false);

  if (!settings || !periods) {
    return (
      <main className="screen">
        <h1 className="screen__title">{strings.tabToday}</h1>
      </main>
    );
  }

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const ongoing = sorted.find((period) => period.endDate === null && period.startDate <= day);
  const lastStart = sorted.length > 0 ? sorted[sorted.length - 1].startDate : null;
  const cycles = deriveCycles(periods);

  // "Period day N" while ongoing, otherwise "Day N of your cycle" (spec 4.6).
  const status = ongoing
    ? strings.statusPeriodDay(diffDays(day, ongoing.startDate) + 1)
    : lastStart !== null
      ? strings.statusCycleDay(diffDays(day, lastStart) + 1)
      : strings.statusNoData;

  const prediction = predictNextPeriod(periods, settings.typicalCycleLength);
  const pattern = displayedPatternLabel(overallPatternLabel(cycles), settings.regularityOverride);

  // Export reminder cadence (spec 9): once after 3 periods, then every 90 days.
  const daysSinceReminder =
    settings.lastExportReminderAt === null ? null : diffDays(day, settings.lastExportReminderAt);
  const showExportReminder =
    periods.length >= EXPORT_REMINDER_AFTER_PERIODS &&
    (daysSinceReminder === null || daysSinceReminder >= EXPORT_REMINDER_INTERVAL_DAYS);

  async function handleStartPeriod() {
    setError(null);
    const validation = validatePeriod(day, null, await db.periods.toArray());
    if (validation !== null) {
      setError(validation === 'overlap' ? strings.errorPeriodOverlap : strings.errorEndBeforeStart);
      return;
    }
    await createPeriod(day, null);
  }

  async function handleEndPeriod() {
    setError(null);
    if (!ongoing) return;
    await updatePeriod({ ...ongoing, endDate: day });
  }

    const handleExportReminder = async () => {
    await exportBackup(db);
    await saveSettings({ ...settings, lastExportReminderAt: day });
  };

  return (
    <main className="screen">
      <h1 className="screen__title">{strings.tabToday}</h1>

      {showExportReminder && (
        <section className="banner" aria-label={strings.exportReminderTitle}>
          <p className="banner__title">{strings.exportReminderTitle}</p>
          <p>{strings.exportReminderBody}</p>
          <div className="banner__actions">
            <button type="button" className="btn btn--primary" onClick={handleExportReminder}>
              {strings.exportReminderAction}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => saveSettings({ ...settings, lastExportReminderAt: day })}
            >
              {strings.exportReminderDismiss}
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <p className="hero__status">{status}</p>
        <button
          type="button"
          className="btn btn--ghost pattern"
          aria-expanded={showPatternInfo}
          onClick={() => setShowPatternInfo((value) => !value)}
        >
          {PATTERN_TEXT[pattern]}
        </button>
        {showPatternInfo && (
          <p className="card__note">
            <strong>{strings.patternExplanationTitle}. </strong>
            {strings.patternExplanation(CYCLE_LENGTH_MIN, CYCLE_LENGTH_MAX, MAX_VARIATION, MIN_CYCLES_FOR_PATTERN)}
          </p>
        )}
      </section>

      <section className="card">
        {prediction ? (
          <>
            <p className="card__big">
              {strings.predictionRange(formatDayLong(prediction.rangeStart), formatDayLong(prediction.rangeEnd))}
            </p>
            <p className="card__note">{strings.predictionEstimateNote}</p>
            {prediction.basedOnEstimate && <p className="card__note">{strings.predictionBasedOnEstimate}</p>}
            {prediction.lessReliable && <p className="card__note">{strings.predictionIrregularNote}</p>}
            {isPredictionPassed(prediction, day, Boolean(ongoing)) && (
              <p className="card__note">{strings.predictionPassed}</p>
            )}
          </>
        ) : (
          <p>{strings.predictionNeedCycles}</p>
        )}
      </section>

      <div className="actions">
        {!ongoing && (
          <button type="button" className="btn btn--primary" onClick={handleStartPeriod}>
            {strings.actionPeriodStarted}
          </button>
        )}
        {ongoing && (
          <button type="button" className="btn btn--primary" onClick={handleEndPeriod}>
            {strings.actionPeriodEnded}
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={() => setLogOpen(true)}>
          {strings.actionLogToday}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setPeriodsOpen(true)}>
          {strings.managePeriods}
        </button>
      </div>

      {error !== null && <p className="error" role="alert">{error}</p>}

      {entry && (
        <section className="card" aria-label={strings.todayEntryTitle}>
          <h2 className="card__heading">{strings.todayEntryTitle}</h2>
          <ul className="entry-list">
            {entrySummaryLines(entry).map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {logOpen && <LogSheet date={day} onClose={() => setLogOpen(false)} />}
      {periodsOpen && <PeriodSheet onClose={() => setPeriodsOpen(false)} />}
    </main>
  );
      }
