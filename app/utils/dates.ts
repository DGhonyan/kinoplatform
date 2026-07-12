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

/** "June 1, 2026" — long date, no time. */
export const formatDate = (value: string | Date, locale: string): string =>
  toDate(value).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/** "Jun 1, 2026, 3:04 PM" — medium date + short time. */
export const formatDateTime = (value: string | Date, locale: string): string =>
  toDate(value).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

/** "June 2026" — month + year, for calendar headers. */
export const formatMonthYear = (value: string | Date, locale: string): string =>
  toDate(value).toLocaleDateString(locale, { year: 'numeric', month: 'long' });
