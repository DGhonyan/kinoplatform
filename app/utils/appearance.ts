import type { Appearance } from '~~/shared/types/user';

/** Additional-photos policy for actors (min enforced by validation, max by the grid). */
export const MIN_ACTOR_PHOTOS = 2;
export const MAX_ACTOR_PHOTOS = 6;

/** The mandatory appearance fields, all present. Gates actor completeness. */
export const isAppearanceComplete = (a?: Appearance | null): boolean =>
  !!(a && a.height && a.weight && a.hairColor && a.eyeColor && a.skinColor);

/** At least the minimum number of additional photos are on file. */
export const hasRequiredActorPhotos = (photos?: string[] | null): boolean =>
  (photos?.length ?? 0) >= MIN_ACTOR_PHOTOS;

/**
 * Predefined appearance option ids. Each id is both the stored value and its
 * i18n key. `hairColor` additionally accepts a free custom string (see the
 * AppearancePopup) when none of the presets fit.
 */
export const HAIR_COLORS = [
  'hair_black',
  'hair_dark_brown',
  'hair_brown',
  'hair_light_brown',
  'hair_blonde',
  'hair_red',
  'hair_auburn',
  'hair_gray',
  'hair_white',
  'hair_bald',
] as const;

export const EYE_COLORS = [
  'eye_brown',
  'eye_hazel',
  'eye_amber',
  'eye_green',
  'eye_blue',
  'eye_gray',
  'eye_black',
] as const;

export const SKIN_COLORS = [
  'skin_fair',
  'skin_light',
  'skin_medium',
  'skin_olive',
  'skin_brown',
  'skin_dark',
  'skin_deep',
] as const;

/**
 * Visible physical characteristics (optional). The free-text "Other" is a
 * separate `otherCharacteristic` field on the appearance, not an entry here.
 */
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
