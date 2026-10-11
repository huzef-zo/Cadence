import { parseDay } from '../logic/dates';
import type { Lang } from './languages';

export function localeTag(lang: Lang): string {
  switch (lang) {
    case 'en':
      return 'en-US';
    case 'am':
      return 'am-ET';
    case 'ar':
      return 'ar';
    default: {
      const _exhaustiveCheck: never = lang;
      return _exhaustiveCheck;
    }
  }
}

function getFormatterLocale(lang: Lang): string {
  return `${localeTag(lang)}-u-ca-gregory-nu-latn`;
}

export function formatDayLong(lang: Lang, day: string): string {
  const date = parseDay(day);
  const formatter = new Intl.DateTimeFormat(getFormatterLocale(lang), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
}

export function formatMonthYear(lang: Lang, date: Date): string {
  const formatter = new Intl.DateTimeFormat(getFormatterLocale(lang), {
    month: 'long',
    year: 'numeric',
  });
  return formatter.format(date);
}

export function weekdayLabels(lang: Lang, weekStartsOn: 0 | 1 | 6): string[] {
  const formatter = new Intl.DateTimeFormat(getFormatterLocale(lang), { weekday: 'short' });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayOffset = (weekStartsOn + i) % 7;
    // 2023-01-01 was a Sunday (dayOffset = 0)
    const date = new Date(2023, 0, 1 + dayOffset);
    labels.push(formatter.format(date));
  }
  return labels;
}

export function resolveWeekStart(
  setting: 'default' | 'sunday' | 'monday' | 'saturday' | undefined | null,
  lang: Lang,
): 0 | 1 | 6 {
  if (setting === 'sunday') return 0;
  if (setting === 'monday') return 1;
  if (setting === 'saturday') return 6;
  if (lang === 'ar') return 6;
  return 0;
}
