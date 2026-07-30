import { ACTOR_PROFESSIONS, CREW_PROFESSIONS, TALENT_PROFESSIONS } from '~/utils/constants';
import { isAppearanceComplete, hasRequiredActorPhotos } from '~/utils/appearance';
import type { User } from '~~/shared/types/user';

// Persona is DERIVED from professions, never stored as a flag — a user can be
// both crew and actor and then sees the union of both field sets.
export const isActor = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (ACTOR_PROFESSIONS as readonly string[]).includes(p));

export const isCrew = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (CREW_PROFESSIONS as readonly string[]).includes(p));

// Talents-page membership: on-camera performers plus voice talent. Broader than
// `isActor`, which stays the gate for appearance fields.
export const isTalent = (professions?: string[] | null): boolean =>
  (professions ?? []).some(p => (TALENT_PROFESSIONS as readonly string[]).includes(p));

// An actor missing mandatory appearance/photos. Only reachable by ADDING an
// acting role after onboarding; data-derived, so no step tracking is needed.
export const needsActorDetails = (
  user?: Pick<User, 'profession' | 'appearance' | 'additionalPhotos'> | null,
): boolean =>
  isActor(user?.profession)
  && !(isAppearanceComplete(user?.appearance) && hasRequiredActorPhotos(user?.additionalPhotos));
