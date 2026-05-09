import en from './locales/en.json';
import hy from './locales/hy.json';

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  fallbackLocale: 'en',
  messages: {
    en,
    hy,
  },
}));
