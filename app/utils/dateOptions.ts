/**
 * Select-item sources for month/year pickers, shared by the project and
 * experience forms.
 */

/** Localized month names → { value: '1'..'12', title }. */
export const monthOptions = (locale: string) =>
  Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    title: new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }),
  }));

/** Descending years from the current one, `count` deep. */
export const yearOptions = (count = 71, from = new Date().getFullYear()) =>
  Array.from({ length: count }, (_, i) => {
    const y = from - i;
    return { value: String(y), title: String(y) };
  });
