import type { User } from '~~/shared/types/user';

/**
 * Pure onboarding constants + gate predicate. Lives here (not in
 * registerSteps.ts) so always-loaded consumers — the global middleware and the
 * Header — can import the gate WITHOUT pulling the five wizard step SFCs into
 * their bundle. registerSteps.ts re-exports these for the component layer.
 */

/**
 * Every completable onboarding step. The first six (REQUIRED_ONBOARDING_STEPS)
 * gate `onboardingComplete`; the wizard owns the first five and the required
 * "essentials" popup owns the sixth. The last two are optional profile popups
 * tracked here only so the profile-completion banner knows what's left.
 */
export const STEP_IDS = {
  CREDENTIALS: 'credentials',
  CODE: 'code',
  NAME: 'name',
  LOCATION: 'location',
  PROFESSION: 'profession',
  ESSENTIALS: 'essentials',
  BACKGROUND_DETAILS: 'background_details',
  GEAR: 'gear',
} as const;

export type StepId = typeof STEP_IDS[keyof typeof STEP_IDS];

/** The five steps the registration wizard renders, in order. */
export const WIZARD_STEP_IDS = [
  STEP_IDS.CREDENTIALS,
  STEP_IDS.CODE,
  STEP_IDS.NAME,
  STEP_IDS.LOCATION,
  STEP_IDS.PROFESSION,
] as const;

export type WizardStepId = typeof WIZARD_STEP_IDS[number];

/**
 * Steps that must be done before `onboardingComplete` is true. Mirrors the
 * backend's REQUIRED_ONBOARDING_STEPS — keep them in sync. The two optional
 * popups (BACKGROUND_DETAILS, GEAR) are deliberately absent.
 */
export const REQUIRED_ONBOARDING_STEPS: StepId[] = [
  STEP_IDS.CREDENTIALS,
  STEP_IDS.CODE,
  STEP_IDS.NAME,
  STEP_IDS.LOCATION,
  STEP_IDS.PROFESSION,
  STEP_IDS.ESSENTIALS,
];

/**
 * Whether the user has finished mandatory onboarding. Prefers the backend's
 * explicit `onboardingComplete` flag; falls back to deriving it from
 * `completedSteps` so the frontend behaves correctly even before the backend
 * ships the flag.
 */
export const isOnboardingComplete = (
  user: Pick<User, 'onboardingComplete' | 'completedSteps'> | null | undefined,
): boolean => {
  if (!user) return false;
  if (typeof user.onboardingComplete === 'boolean') return user.onboardingComplete;
  const done = new Set(user.completedSteps ?? []);
  return REQUIRED_ONBOARDING_STEPS.every(step => done.has(step));
};
