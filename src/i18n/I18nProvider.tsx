import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { en, type Strings } from './en';
import { am } from './am';
import { ar } from './ar';
import { dirFor, resolveLanguage, type Lang } from './languages';
import { getSettings } from '../db/queries';
import { useLiveQuery } from '../db/hooks';
import { formatDayLong } from '../logic/dates';

export type { Lang };
export type Dir = 'ltr' | 'rtl';

const dictionaries: Record<Lang, Strings> = {
  en,
  am,
  ar,
};

export interface I18nContextValue {
  t: Strings;
  lang: Lang;
  dir: Dir;
  formatDay: (day: string) => string;
  formatMonth: (date: Date) => string;
  weekdayShort: readonly string[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const settings = useLiveQuery(() => getSettings(), []);
  const preferredLangs = typeof navigator !== 'undefined' && navigator.languages ? navigator.languages : [];
  const lang = resolveLanguage(settings?.language ?? 'system', preferredLangs);
  const dir = dirFor(lang);
  const t = dictionaries[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nContextValue>(
    () => ({
      t,
      lang,
      dir,
      formatDay: (day: string) => formatDayLong(day),
      formatMonth: (date: Date) => format(date, 'MMMM yyyy'),
      weekdayShort: t.weekdayShort,
    }),
    [t, lang, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
