/**
 * Language list + display helpers, backed by `Intl.DisplayNames`.
 *
 * Storage: ISO 639-1 two-letter codes (`'en'`, `'hy'`, `'fr'`, ...). What we
 * persist server-side and what backend agents should treat as the contract.
 *
 * Display: localized to the current UI locale via `Intl.DisplayNames`. So
 * Armenian users see "Անգլերեն" for `'en'` while English users see "English".
 *
 * Search: matches against the code, the English name, the native name, and
 * the current-locale name — so "armenian", "հայերեն", and "hy" all find `hy`.
 */

const DISPLAY_NAMES_CACHE = new Map<string, Intl.DisplayNames>();

const displayNamesFor = (locale: string): Intl.DisplayNames => {
  let instance = DISPLAY_NAMES_CACHE.get(locale);
  if (!instance) {
    // `fallback: 'none'` makes `.of(code)` return `undefined` when the browser's
    // CLDR data has no translation for that code in this locale. With the default
    // (`'code'`) it would return the code itself, which surfaces as raw "aa",
    // "ab", etc. in the dropdown — we want to detect and skip those instead.
    instance = new Intl.DisplayNames([locale], { type: 'language', fallback: 'none' });
    DISPLAY_NAMES_CACHE.set(locale, instance);
  }
  return instance;
};

/**
 * Returns a localized language name, or `null` if neither the active locale
 * nor English has a translation. The two-stage fallback (active locale → en)
 * means Armenian users still see "Avestan" rather than "ae" for languages
 * that hy CLDR doesn't cover. `null` callers should drop the language from
 * the visible list — showing a raw code helps no one.
 */
export const getLanguageDisplayName = (code: string, locale: string): string | null => {
  return displayNamesFor(locale).of(code)
    ?? displayNamesFor('en').of(code)
    ?? null;
};

const HAYSTACK_CACHE = new Map<string, string>();

export const getLanguageSearchHaystack = (code: string, locale: string): string => {
  const key = `${locale}:${code}`;
  let haystack = HAYSTACK_CACHE.get(key);
  if (!haystack) {
    const english = displayNamesFor('en').of(code) ?? '';
    // Some codes aren't valid as locale tags themselves (very obscure ones),
    // which would make the `Intl.DisplayNames` constructor throw. Treat those
    // as having no native name and move on.
    let native = '';
    try {
      native = displayNamesFor(code).of(code) ?? '';
    }
    catch {
      // ignore — code isn't a usable locale tag
    }
    const localized = displayNamesFor(locale).of(code) ?? '';
    haystack = `${code} ${english} ${native} ${localized}`.toLowerCase();
    HAYSTACK_CACHE.set(key, haystack);
  }
  return haystack;
};

// Full ISO 639-1 set. Cheap (a string array), and lets `Intl.DisplayNames`
// do the rest. Trim later if we decide the long tail (Avestan, Volapük, ...)
// is more noise than signal.
export const LANGUAGE_CODES: readonly string[] = [
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av',
  'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo',
  'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv',
  'cy', 'da', 'de', 'dv', 'dz', 'ee', 'el', 'en', 'eo', 'es',
  'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga',
  'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr',
  'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik',
  'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj',
  'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw',
  'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv',
  'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps',
  'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd',
  'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr',
  'ss', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti',
  'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug',
  'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi',
  'yo', 'za', 'zh', 'zu',
];
