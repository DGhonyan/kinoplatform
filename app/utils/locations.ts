// Presentation helpers shared by the locations card, list and detail page —
// one home for the price formatting and the amenity/safety glyph tables so the
// three views can't drift apart.

import type { LocationAmenity, LocationSafety } from '~~/shared/types/location';

/*
 * `Intl.NumberFormat` builds a fresh ICU formatter per call — the slow path,
 * and this runs once per card. Cache one per (locale, currency) pair, the same
 * trick dates.ts uses.
 */
const priceFormatters = new Map<string, Intl.NumberFormat>();

/**
 * "45,000 AMD" — grouped amount plus the raw currency code.
 *
 * Deliberately NOT `style: 'currency'`: the backend stores a free-form code and
 * ICU renders unknown ones as-is but known ones as a symbol in a locale-specific
 * position, so prices would render inconsistently across the catalogue.
 */
export const formatPrice = (amount: number, currency: string, locale: string): string => {
  let formatter = priceFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    priceFormatters.set(locale, formatter);
  }
  return `${formatter.format(amount)} ${currency}`.trim();
};

/** Whole nights between two 'YYYY-MM-DD' dates; 0 when either is missing or the range is backwards. */
export const nightsBetween = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  // Parse as local midnight so a DST boundary inside the range can't shave the
  // difference below a whole day.
  const from = new Date(`${checkIn}T00:00:00`).getTime();
  const to = new Date(`${checkOut}T00:00:00`).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86_400_000));
};

/** mdi glyph per amenity — the "What's included" chips. */
export const AMENITY_ICONS: Record<LocationAmenity, string> = {
  wifi: 'mdi-wifi',
  water_heating: 'mdi-water-boiler',
  heating: 'mdi-radiator',
  hygiene_products: 'mdi-shower-head',
  fridge: 'mdi-fridge-outline',
  tv: 'mdi-television',
  coffee_maker: 'mdi-coffee-maker',
  parking: 'mdi-car',
  kitchen: 'mdi-silverware-fork-knife',
  air_conditioning: 'mdi-air-conditioner',
  power_generator: 'mdi-engine-outline',
};

/** mdi glyph per safety feature — the "Important to know" list. */
export const SAFETY_ICONS: Record<LocationSafety, string> = {
  carbon_monoxide_alarm: 'mdi-molecule-co',
  smoke_alarm: 'mdi-smoke-detector-variant',
  first_aid_kit: 'mdi-medical-bag',
  fire_extinguisher: 'mdi-fire-extinguisher',
  must_climb_stairs: 'mdi-stairs',
  security_camera: 'mdi-cctv',
};
