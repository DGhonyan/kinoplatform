import { ACTOR_PROFESSIONS, CREW_PROFESSIONS, TALENT_PROFESSIONS } from '~/utils/constants';
import { isAppearanceComplete, hasRequiredActorPhotos } from '~/utils/appearance';
import type { User } from '~~/shared/types/user';

/**
 * Persona is derived from the user's professions — never stored as a flag. A
 * user can be both crew and actor, in which case they see the union of both sets
 * of fields. These helpers are the single source of truth for every persona-gated
 * input (appearance, additional photos, gear, …).
 */
export const isActor = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (ACTOR_PROFESSIONS as readonly string[]).includes(p));

export const isCrew = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (CREW_PROFESSIONS as readonly string[]).includes(p));

/**
 * Talents-page membership: on-camera performers PLUS voice/audio talent. Broader
 * than `isActor` — voice talent register like crew (no appearance) but still list
 * as talents. Used for the talents-page filter; the appearance gate stays `isActor`.
 */
export const isTalent = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (TALENT_PROFESSIONS as readonly string[]).includes(p));

/**
 * An actor (by profession) whose mandatory appearance/photos aren't on file yet.
 * The essentials popup validates actor fields at completion time, so this can
 * only become true when a user ADDS an acting role after onboarding. Data-derived,
 * so it re-evaluates on every mount — no step tracking needed.
 */
export const needsActorDetails = (
  user?: Pick<User, 'profession' | 'appearance' | 'additionalPhotos'> | null,
): boolean =>
  isActor(user?.profession)
  && !(isAppearanceComplete(user?.appearance) && hasRequiredActorPhotos(user?.additionalPhotos));
