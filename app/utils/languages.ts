// ISO 639-1 codes are the stored contract; names localize via Intl.DisplayNames,
// and search matches the code plus the English, native, and current-locale names.

const DISPLAY_NAMES_CACHE = new Map<string, Intl.DisplayNames>();

const displayNamesFor = (locale: string): Intl.DisplayNames => {
  let instance = DISPLAY_NAMES_CACHE.get(locale);
  if (!instance) {
    // fallback: 'none' → `.of()` is undefined when CLDR lacks a translation;
    // the default ('code') would surface raw "aa"/"ab" in the dropdown.
    instance = new Intl.DisplayNames([locale], { type: 'language', fallback: 'none' });
    DISPLAY_NAMES_CACHE.set(locale, instance);
  }
  return instance;
};

/**
 * Localized name with active-locale → English fallback; `null` when neither
 * covers the code — callers should drop it rather than show a raw code.
 */
export const getLanguageDisplayName = (code: string, locale: string): string | null => {
  try {
    return displayNamesFor(locale).of(code)
      ?? displayNamesFor('en').of(code)
      ?? null;
  }
  catch {
    return null;
  }
};

const HAYSTACK_CACHE = new Map<string, string>();

export const getLanguageSearchHaystack = (code: string, locale: string): string => {
  const key = `${locale}:${code}`;
  let haystack = HAYSTACK_CACHE.get(key);
  if (!haystack) {
    const english = displayNamesFor('en').of(code) ?? '';
    // Obscure codes aren't valid locale tags and make the constructor throw —
    // treat those as having no native name.
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

// Full ISO 639-1 set — trim the long tail later if it's more noise than signal.
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
