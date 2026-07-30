// Vuetify generates utility classes for base palette colors but NOT `on-*`
// tokens, so `color="on-surface"` no-ops — map those to rgb(var(--v-theme-…)).
export const resolveThemeColor = (value?: string): string | undefined =>
  value?.startsWith('on-') ? `rgb(var(--v-theme-${value}))` : value;

// Like resolveThemeColor but for a RAW CSS color (e.g. inside v-bind()), where
// Vuetify's token names aren't valid. Real colors pass through untouched.
export const themeColorToCss = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith('#') || value.includes('(')) return value;
  return `rgb(var(--v-theme-${value}))`;
};
