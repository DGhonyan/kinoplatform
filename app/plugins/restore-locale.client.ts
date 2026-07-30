// Restore the saved language at app boot. It can't live in LanguageSelector's
// onMounted — that component only renders on the settings page.
export default defineNuxtPlugin(() => {
  const saved = localStorage.getItem('locale');
  if (saved !== 'en' && saved !== 'hy') return;

  const i18n = useNuxtApp().$i18n as {
    locale: { value: string };
    setLocale?: (locale: string) => Promise<void> | void;
  };
  if (!i18n?.locale || i18n.locale.value === saved) return;

  // setLocale also loads the target locale's messages (if lazily loaded);
  // fall back to a direct assignment if it isn't available.
  if (typeof i18n.setLocale === 'function') void i18n.setLocale(saved);
  else i18n.locale.value = saved;
});
