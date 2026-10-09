import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useI18n } from '../i18n';
import { db } from '../db/db';
import { useLiveQuery, useToday } from '../db/hooks';
import { DayCell, type DayInfo } from '../components/DayCell';
import { LogSheet } from '../components/LogSheet';
import { addDaysToDay } from '../logic/dates';
import { predictNextPeriod } from '../logic/prediction';
import type { Period } from '../db/types';

function periodDaysFrom(periods: Period[], todayString: string): Set<string> {
  const days = new Set<string>();
  const lastDay = todayString;
  for (const period of periods) {
    // An ongoing period (no end date yet) is marked up to today.
    const end = period.endDate ?? (period.startDate <= lastDay ? lastDay : period.startDate);
    for (let day = period.startDate; day <= end; day = addDaysToDay(day, 1)) {
      days.add(day);
    }
  }
  return days;
}

export function Calendar() {
  const { t, formatMonth, weekdayShort } = useI18n();
  const todayString = useToday();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const periods = useLiveQuery(() => db.periods.toArray(), []);
  const entries = useLiveQuery(() => db.entries.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get('main'), []);

  const days = useMemo<DayInfo[]>(() => {
    if (!periods || !entries) return [];
    const periodDays = periodDaysFrom(periods, todayString);

    // Predicted period days: union of the predicted-start range and the
    // predicted bleeding days after it.
    const predictedDays = new Set<string>();
    const prediction = predictNextPeriod(periods, settings?.typicalCycleLength ?? null);
    if (prediction) {
      const lastPredicted = addDaysToDay(prediction.rangeEnd, prediction.predictedPeriodLength - 1);
      for (let day = prediction.rangeStart; day <= lastPredicted; day = addDaysToDay(day, 1)) {
        predictedDays.add(day);
      }
    }

    const loggedDays = new Set(entries.map((entry) => entry.date));
    const gridStart = startOfWeek(startOfMonth(month));
    const gridEnd = endOfWeek(endOfMonth(month));

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
      const dayString = format(date, 'yyyy-MM-dd');
      return {
        date: dayString,
        inMonth: isSameMonth(date, month),
        isPeriod: periodDays.has(dayString),
        isPredicted: !periodDays.has(dayString) && predictedDays.has(dayString),
        hasLog: loggedDays.has(dayString),
        isToday: dayString === todayString,
      };
    });
  }, [periods, entries, settings, month, todayString]);

  return (
    <main className="screen">
      <h1 className="screen__title">{t.tabCalendar}</h1>

      <div className="calendar-nav">
        <button
          type="button"
          className="btn btn--ghost"
          aria-label={t.calendarPrevMonth}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          ‹
        </button>
        <h2 className="calendar-month" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <button
          type="button"
          className="btn btn--ghost"
          aria-label={t.calendarNextMonth}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-grid" role="group" aria-label={formatMonth(month)}>
        {weekdayShort.map((weekday) => (
          <span key={weekday} className="calendar-weekday">
            {weekday}
          </span>
        ))}
        {days.map((day) => (
          <DayCell key={day.date} day={day} onSelect={setSelected} />
        ))}
      </div>

      <ul className="legend">
        <li className="legend__item"><span className="legend__marker legend__marker--period" aria-hidden="true" /> {t.legendPeriod}</li>
        <li className="legend__item"><span className="legend__marker legend__marker--predicted" aria-hidden="true" /> {t.legendPredicted}</li>
        <li className="legend__item"><span className="legend__marker legend__marker--log" aria-hidden="true" /> {t.legendLogged}</li>
        <li className="legend__item"><span className="legend__marker legend__marker--today" aria-hidden="true" /> {t.legendToday}</li>
      </ul>

      {selected !== null && <LogSheet date={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
