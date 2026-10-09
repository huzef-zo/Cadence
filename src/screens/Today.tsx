import { useState } from 'react';
import { useI18n } from '../i18n';
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
import { diffDays } from '../logic/dates';
import { isPredictionPassed, predictNextPeriod } from '../logic/prediction';
import { displayedPatternLabel, overallPatternLabel, type PatternLabel } from '../logic/regularity';
import { validatePeriod } from '../logic/validation';

export function Today() {
  const { t, formatDay } = useI18n();
  const day = useToday();
  const settings = useLiveQuery(() => getSettings(), []);
  const periods = useLiveQuery(() => db.periods.toArray(), []);
  const entry = useLiveQuery(() => db.entries.get(day), [day]);
  const [logOpen, setLogOpen] = useState(false);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatternInfo, setShowPatternInfo] = useState(false);

  const patternText: Record<PatternLabel, string> = {
    regular: t.patternRegular,
    irregular: t.patternIrregular,
    'not-enough-data': t.patternNotEnoughData,
  };

  if (!settings || !periods) {
    return (
      <main className="screen">
        <h1 className="screen__title">{t.tabToday}</h1>
      </main>
    );
  }

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const ongoing = sorted.find((period) => period.endDate === null && period.startDate <= day);
  const lastStart = sorted.length > 0 ? sorted[sorted.length - 1].startDate : null;
  const cycles = deriveCycles(periods);

  // "Period day N" while ongoing, otherwise "Day N of your cycle" (spec 4.6).
  const status = ongoing
    ? t.statusPeriodDay(diffDays(day, ongoing.startDate) + 1)
    : lastStart !== null
      ? t.statusCycleDay(diffDays(day, lastStart) + 1)
      : t.statusNoData;

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
      setError(validation === 'overlap' ? t.errorPeriodOverlap : t.errorEndBeforeStart);
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
      <h1 className="screen__title">{t.tabToday}</h1>

      {showExportReminder && (
        <section className="banner" aria-label={t.exportReminderTitle}>
          <p className="banner__title">{t.exportReminderTitle}</p>
          <p>{t.exportReminderBody}</p>
          <div className="banner__actions">
            <button type="button" className="btn btn--primary" onClick={handleExportReminder}>
              {t.exportReminderAction}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => saveSettings({ ...settings, lastExportReminderAt: day })}
            >
              {t.exportReminderDismiss}
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
          {patternText[pattern]}
        </button>
        {showPatternInfo && (
          <p className="card__note">
            <strong>{t.patternExplanationTitle}. </strong>
            {t.patternExplanation(CYCLE_LENGTH_MIN, CYCLE_LENGTH_MAX, MAX_VARIATION, MIN_CYCLES_FOR_PATTERN)}
          </p>
        )}
      </section>

      <section className="card">
        {prediction ? (
          <>
            <p className="card__big">
              {t.predictionRange(formatDay(prediction.rangeStart), formatDay(prediction.rangeEnd))}
            </p>
            <p className="card__note">{t.predictionEstimateNote}</p>
            {prediction.basedOnEstimate && <p className="card__note">{t.predictionBasedOnEstimate}</p>}
            {prediction.lessReliable && <p className="card__note">{t.predictionIrregularNote}</p>}
            {isPredictionPassed(prediction, day, Boolean(ongoing)) && (
              <p className="card__note">{t.predictionPassed}</p>
            )}
          </>
        ) : (
          <p>{t.predictionNeedCycles}</p>
        )}
      </section>

      <div className="actions">
        {!ongoing && (
          <button type="button" className="btn btn--primary" onClick={handleStartPeriod}>
            {t.actionPeriodStarted}
          </button>
        )}
        {ongoing && (
          <button type="button" className="btn btn--primary" onClick={handleEndPeriod}>
            {t.actionPeriodEnded}
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={() => setLogOpen(true)}>
          {t.actionLogToday}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setPeriodsOpen(true)}>
          {t.managePeriods}
        </button>
      </div>

      {error !== null && <p className="error" role="alert">{error}</p>}

      {entry && (
        <section className="card" aria-label={t.todayEntryTitle}>
          <h2 className="card__heading">{t.todayEntryTitle}</h2>
          <ul className="entry-list">
            {entrySummaryLines(entry, t).map((line, index) => (
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
