import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { en, type Strings } from './en';
import { formatDayLong } from '../logic/dates';

export type Lang = 'en';
export type Dir = 'ltr' | 'rtl';

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
  const lang: Lang = 'en';
  const dir: Dir = 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nContextValue>(
    () => ({
      t: en,
      lang,
      dir,
      formatDay: (day: string) => formatDayLong(day),
      formatMonth: (date: Date) => format(date, 'MMMM yyyy'),
      weekdayShort: en.weekdayShort,
    }),
    [lang, dir],
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
