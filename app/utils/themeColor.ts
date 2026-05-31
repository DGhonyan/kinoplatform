/**
 * Vuetify only generates `bg-*` / `text-*` utility classes for base palette
 * colors, not for `on-*` tokens (`on-surface`, `on-primary`, …), so passing
 * `color="on-surface"` to a component silently no-ops. The CSS variable
 * `--v-theme-on-surface` *is* emitted, though, so map `on-*` tokens to the
 * `rgb(var(--v-theme-…))` form — a literal color Vuetify applies inline.
 * Everything else (base tokens, hex, rgb(), undefined) passes through untouched.
 */
export const resolveThemeColor = (value?: string): string | undefined =>
  value?.startsWith('on-') ? `rgb(var(--v-theme-${value}))` : value;

/**
 * Like `resolveThemeColor`, but for use as a *raw CSS color* (e.g. `color:` in a
 * `v-bind()` style), where Vuetify's palette token names aren't valid. A bare
 * theme token (`background`, `primary`, `on-surface`, …) becomes
 * `rgb(var(--v-theme-…))`; anything that's already a CSS color (hex, `rgb()`,
 * `var()`, …) passes through untouched.
 */
export const themeColorToCss = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith('#') || value.includes('(')) return value;
  return `rgb(var(--v-theme-${value}))`;
};
