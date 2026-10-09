import { useEffect } from 'react';
import { useI18n } from '../i18n';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { listPeriods } from '../db/queries';
import { REMINDER_TICK_MS } from '../logic/config';
import { toDay } from '../logic/dates';
import { predictNextPeriod } from '../logic/prediction';
import { minutesNow, parseTimeToMinutes, periodSoonReminderDate } from '../logic/reminders';

// Fired keys live for this app session only — reminders are best effort (4.7).
const firedKeys = new Set<string>();

function notify(title: string, body: string) {
  try {
    new Notification(title, { body });
  } catch {
    // Some browsers only allow notifications via the service worker; ignore.
  }
}

// Non-visual host: checks once a minute while the app is open and fires local
// notifications when due. Never required; hidden gracefully when unsupported.
export function ReminderHost() {
  const { t } = useI18n();
  const settings = useLiveQuery(() => db.settings.get('main'), []);
  const periods = useLiveQuery(() => listPeriods(), []);

  useEffect(() => {
    if (!settings || !periods) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    function tick() {
      if (!settings || !periods) return;
      const now = new Date();
      const day = toDay(now);

      if (settings.reminders.dailyLog && settings.reminders.dailyTime !== null) {
        const target = parseTimeToMinutes(settings.reminders.dailyTime);
        const key = `daily:${day}`;
        if (target !== null && minutesNow(now) >= target && !firedKeys.has(key)) {
          firedKeys.add(key);
          notify(t.reminderDailyLogTitle, t.reminderDailyLogBody);
        }
      }

      if (settings.reminders.periodSoon) {
        const prediction = predictNextPeriod(periods, settings.typicalCycleLength);
        if (prediction && !prediction.basedOnEstimate) {
          const remindOn = periodSoonReminderDate(prediction.predictedStart, settings.reminders.daysBefore);
          const key = `period-soon:${remindOn}`;
          if (remindOn === day && !firedKeys.has(key)) {
            firedKeys.add(key);
            notify(t.reminderPeriodSoonTitle, t.reminderPeriodSoonBody);
          }
        }
      }
    }

    tick();
    const interval = window.setInterval(tick, REMINDER_TICK_MS);
    return () => window.clearInterval(interval);
  }, [settings, periods, t]);

  return null;
}
