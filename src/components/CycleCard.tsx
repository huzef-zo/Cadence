import { useState } from 'react';
import { moodLabels, strings } from '../i18n/en';
import { entrySummaryLines } from './EntrySummary';
import type { Cycle } from '../logic/types';
import { singleCycleLabel, singleCycleNote } from '../logic/regularity';
import { mean, mostFrequent } from '../logic/stats';
import { addDaysToDay, formatDayLong, today } from '../logic/dates';
import type { DayEntry } from '../db/types';

interface CycleCardProps {
  cycle: Cycle;
  entries: DayEntry[];
}

export function CycleCard({ cycle, entries }: CycleCardProps) {
  const [open, setOpen] = useState(false);

  const cycleEnd = cycle.cycleLength !== null ? addDaysToDay(cycle.startDate, cycle.cycleLength - 1) : today();
  const cycleEntries = entries
    .filter((entry) => entry.date >= cycle.startDate && entry.date <= cycleEnd)
    .sort((a, b) => a.date.localeCompare(b.date));

  const pains = cycleEntries.flatMap((entry) => (entry.pain === null ? [] : [entry.pain]));
  const moods = cycleEntries.flatMap((entry) => (entry.mood === null ? [entry.mood] : []));
  const averagePain = pains.length > 0 ? Math.round(mean(pains) * 10) / 10 : null;
  const frequentMood = mostFrequent(moods);

  const label = cycle.cycleLength !== null ? singleCycleLabel(cycle.cycleLength) : null;
  const note = cycle.cycleLength !== null ? singleCycleNote(cycle.cycleLength) : null;

  return (
    <article className="card">
      <button type="button" className="card__toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="card__title">
          {formatDayLong(cycle.startDate)} –{' '}
          {cycle.periodEndDate !== null ? formatDayLong(cycle.periodEndDate) : strings.periodOngoing}
        </span>
        <span className="card__meta">
          {strings.cardPeriodLength}:{' '}
          {cycle.periodLength !== null ? strings.days(cycle.periodLength) : strings.notAvailable}
          {' · '}
          {strings.cardCycleLength}:{' '}
          {cycle.cycleLength !== null ? strings.days(cycle.cycleLength) : strings.periodOngoing}
        </span>
        {label !== null && (
          <span className={`badge ${label === 'within-typical-range' ? 'badge--ok' : 'badge--warn'}`}>
            {label === 'within-typical-range' ? strings.cycleWithinRange : strings.cycleOutsideRange}
          </span>
        )}
        {note !== null && <span className="card__note">{note === 'short' ? strings.noteShort : strings.noteLong}</span>}
        <span className="card__meta">
          {strings.cardAvgPain}: {averagePain !== null ? averagePain : strings.notAvailable}
          {' · '}
          {strings.cardMoodFrequency}: {frequentMood !== null ? moodLabels[frequentMood] : strings.notAvailable}
        </span>
      </button>
      {open && (
        <ul className="entry-list">
          {cycleEntries.length === 0 ? (
            <li className="card__note">{strings.noEntries}</li>
          ) : (
            cycleEntries.map((entry) => (
              <li key={entry.date}>
                <strong>{formatDayLong(entry.date)}</strong> — {entrySummaryLines(entry).join(' · ')}
              </li>
            ))
          )}
        </ul>
      )}
    </article>
  );
}
