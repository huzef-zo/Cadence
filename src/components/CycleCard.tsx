import { useState } from 'react';
import { useI18n } from '../i18n';
import { entrySummaryLines } from './EntrySummary';
import type { Cycle } from '../logic/types';
import { singleCycleLabel, singleCycleNote } from '../logic/regularity';
import { mean, mostFrequent } from '../logic/stats';
import { addDaysToDay, today } from '../logic/dates';
import type { DayEntry } from '../db/types';

interface CycleCardProps {
  cycle: Cycle;
  entries: DayEntry[];
}

export function CycleCard({ cycle, entries }: CycleCardProps) {
  const { t, formatDay } = useI18n();
  const [open, setOpen] = useState(false);

  const cycleEnd = cycle.cycleLength !== null ? addDaysToDay(cycle.startDate, cycle.cycleLength - 1) : today();
  const cycleEntries = entries
    .filter((entry) => entry.date >= cycle.startDate && entry.date <= cycleEnd)
    .sort((a, b) => a.date.localeCompare(b.date));

  const pains = cycleEntries.flatMap((entry) => (entry.pain === null ? [] : [entry.pain]));
  const moods = cycleEntries.flatMap((entry) => (entry.mood === null ? [] : [entry.mood]));
  const averagePain = pains.length > 0 ? Math.round(mean(pains) * 10) / 10 : null;
  const frequentMood = mostFrequent(moods);

  const label = cycle.cycleLength !== null ? singleCycleLabel(cycle.cycleLength) : null;
  const note = cycle.cycleLength !== null ? singleCycleNote(cycle.cycleLength) : null;

  return (
    <article className="card">
      <button type="button" className="card__toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="card__title">
          {formatDay(cycle.startDate)} –{' '}
          {cycle.periodEndDate !== null ? formatDay(cycle.periodEndDate) : t.periodOngoing}
        </span>
        <span className="card__meta">
          {t.cardPeriodLength}:{' '}
          {cycle.periodLength !== null ? t.days(cycle.periodLength) : t.notAvailable}
          {' · '}
          {t.cardCycleLength}:{' '}
          {cycle.cycleLength !== null ? t.days(cycle.cycleLength) : t.periodOngoing}
        </span>
        {label !== null && (
          <span className={`badge ${label === 'within-typical-range' ? 'badge--ok' : 'badge--warn'}`}>
            {label === 'within-typical-range' ? t.cycleWithinRange : t.cycleOutsideRange}
          </span>
        )}
        {note !== null && <span className="card__note">{note === 'short' ? t.noteShort : t.noteLong}</span>}
        <span className="card__meta">
          {t.cardAvgPain}: {averagePain !== null ? averagePain : t.notAvailable}
          {' · '}
          {t.cardMoodFrequency}: {frequentMood !== null ? t.moodLabels[frequentMood] : t.notAvailable}
        </span>
      </button>
      {open && (
        <ul className="entry-list">
          {cycleEntries.length === 0 ? (
            <li className="card__note">{t.noEntries}</li>
          ) : (
            cycleEntries.map((entry) => (
              <li key={entry.date}>
                <strong>{formatDay(entry.date)}</strong> — {entrySummaryLines(entry, t).join(' · ')}
              </li>
            ))
          )}
        </ul>
      )}
    </article>
  );
}
