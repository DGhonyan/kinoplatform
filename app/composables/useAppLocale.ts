export type AppLocale = 'en' | 'hy';

export const APP_LANGUAGES: { title: string; value: AppLocale }[] = [
  { title: 'English', value: 'en' },
  { title: 'Հայերեն', value: 'hy' },
];

/**
 * Single source of truth for switching the app language. Persists the choice to
 * localStorage (restored at boot by plugins/restore-locale.client.ts). Used by
 * both the header LanguageSwitch (guests) and the Settings LanguageSelector.
 */
export function useAppLocale() {
  const { locale } = useI18n();

  const setLocale = (value: AppLocale) => {
    locale.value = value;
    localStorage.setItem('locale', value);
  };

  return { locale, setLocale, languages: APP_LANGUAGES };
}
