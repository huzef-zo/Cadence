export type Lang = 'en' | 'am' | 'ar';

export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  am: 'አማርኛ',
  ar: 'العربية',
};

export const ENABLED_LANGUAGES: Lang[] =
  import.meta.env.VITE_ENABLE_ALL_LANGS === 'true' ? ['en', 'am', 'ar'] : ['en'];

export function dirFor(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function resolveLanguage(
  setting: 'system' | Lang,
  preferred: readonly string[],
  enabled: readonly Lang[] = ENABLED_LANGUAGES,
): Lang {
  if (setting !== 'system' && enabled.includes(setting)) {
    return setting;
  }
  for (const pref of preferred) {
    const primary = pref.split('-')[0].toLowerCase() as Lang;
    if (enabled.includes(primary)) {
      return primary;
    }
  }
  return 'en';
}
