// Locale-aware date formatting — one home for the option-sets so components stop
// hand-rolling (and drifting between) their own toLocaleString calls.

const toDate = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  // A bare 'YYYY-MM-DD' is parsed as UTC midnight by Date; pin it to local time
  // so it never renders as the previous day in negative-offset timezones.
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
};

/*
 * `toLocaleDateString(locale, options)` builds a fresh ICU formatter on every
 * call — the slow path, and these run once per card in a list. Cache one
 * formatter per (locale, shape) instead; there are only a handful of pairs.
 */
const formatters = new Map<string, Intl.DateTimeFormat>();

const formatter = (
  locale: string,
  shape: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const key = `${locale}|${shape}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, f);
  }
  return f;
};

/** "June 1, 2026" — long date, no time. */
export const formatDate = (value: string | Date, locale: string): string =>
  formatter(locale, 'date', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(toDate(value));

/** "Jun 1, 2026, 3:04 PM" — medium date + short time. */
export const formatDateTime = (value: string | Date, locale: string): string =>
  formatter(locale, 'dateTime', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(toDate(value));

/** "June 2026" — month + year, for calendar headers. */
export const formatMonthYear = (value: string | Date, locale: string): string =>
  formatter(locale, 'monthYear', {
    year: 'numeric',
    month: 'long',
  }).format(toDate(value));

/** Today as a local 'YYYY-MM-DD' — for date-only min/expiry checks (no UTC drift). */
export const todayLocalDate = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
