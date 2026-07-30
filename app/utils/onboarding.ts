import type { User } from '~~/shared/types/user';

// Lives here (not registerSteps.ts) so the global middleware and Header can
// import the gate without pulling the wizard step SFCs into their bundle.

/** Every completable onboarding step; the first six gate `onboardingComplete`. */
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

/** Keep in sync with the backend's REQUIRED_ONBOARDING_STEPS. */
export const REQUIRED_ONBOARDING_STEPS: StepId[] = [
  STEP_IDS.CREDENTIALS,
  STEP_IDS.CODE,
  STEP_IDS.NAME,
  STEP_IDS.LOCATION,
  STEP_IDS.PROFESSION,
  STEP_IDS.ESSENTIALS,
];

/** Whether mandatory onboarding is done — backend flag first, derived from `completedSteps` otherwise. */
export const isOnboardingComplete = (
  user: Pick<User, 'onboardingComplete' | 'completedSteps'> | null | undefined,
): boolean => {
  if (!user) return false;
  if (typeof user.onboardingComplete === 'boolean') return user.onboardingComplete;
  const done = new Set(user.completedSteps ?? []);
  return REQUIRED_ONBOARDING_STEPS.every(step => done.has(step));
};
