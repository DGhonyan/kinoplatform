import type { Appearance } from '~~/shared/types/user';

/** Additional-photos policy for actors (min enforced by validation, max by the grid). */
export const MIN_ACTOR_PHOTOS = 2;
export const MAX_ACTOR_PHOTOS = 6;

/** Measurement bounds (cm / kg) — keep in sync with backend AppearanceDto + TalentSearchDto. */
export const HEIGHT_RANGE = { min: 30, max: 300 };
export const WEIGHT_RANGE = { min: 20, max: 500 };

/** The mandatory appearance fields, all present. Gates actor completeness. */
export const isAppearanceComplete = (a?: Appearance | null): boolean =>
  !!(a && a.height && a.weight && a.hairColor && a.eyeColor && a.skinColor);

/** At least the minimum number of additional photos are on file. */
export const hasRequiredActorPhotos = (photos?: string[] | null): boolean =>
  (photos?.length ?? 0) >= MIN_ACTOR_PHOTOS;

/** Whether a hex color reads as light — picks a contrasting checkmark on the selected swatch. */
export const isLightColor = (hex: string): boolean => {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1];
  if (!value) return false;
  const n = parseInt(value, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // Perceived (sRGB-weighted) luminance.
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

// Swatches: the stored value IS the hex string (not an i18n key).
// `hairColor` additionally accepts a custom hex from the color picker.
export const HAIR_COLORS = [
  '#D1C1A3', '#B0997B', '#7F6652', '#7A372E', '#885537', '#937D58',
  '#5A3E28', '#664F47', '#381F18', '#D9943B', '#276B1C', '#2B26B9',
  '#8827A6', '#D92C96', '#D01821', '#848484', '#1D1D1D',
] as const;

export const EYE_COLORS = [
  '#68707B', '#6BAFB8', '#206380', '#728567', '#313E2A',
  '#D2AC6E', '#D59B51', '#9E5930', '#3B1C11',
] as const;

export const SKIN_COLORS = [
  '#FAD4D1', '#F2B8AD', '#EDC190', '#D8AF7B', '#C0946F', '#9C6C44',
  '#81543D', '#684332', '#4A2F24', '#3C1F11', '#2E2520',
] as const;

/** Free-text "Other" is a separate `otherCharacteristic` field, not an entry here. */
export const PHYSICAL_CHARACTERISTICS = [
  'characteristic_amputee_upper',
  'characteristic_amputee_lower',
  'characteristic_prosthetic_limb',
  'characteristic_blind_low_vision',
  'characteristic_deaf_hard_hearing',
  'characteristic_wheelchair_user',
  'characteristic_limb_difference',
  'characteristic_visible_scar',
  'characteristic_freckles',
  'characteristic_vitiligo',
] as const;
