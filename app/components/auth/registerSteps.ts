import type { Component, InjectionKey } from 'vue';
import RegisterStepCredentials from './registerSteps/Credentials.vue';
import RegisterStepCode from './registerSteps/Code.vue';
import RegisterStepName from './registerSteps/Name.vue';
import RegisterStepBackground from './registerSteps/Background.vue';
import RegisterStepExpertise from './registerSteps/Expertise.vue';
import RegisterStepPortfolio from './registerSteps/Portfolio.vue';
import RegisterStepAvatar from './registerSteps/Avatar.vue';
import RegisterStepBio from './registerSteps/Bio.vue';

export const STEP_IDS = {
  CREDENTIALS: 'credentials',
  CODE: 'code',
  NAME: 'name',
  BACKGROUND: 'background',
  EXPERTISE: 'expertise',
  PORTFOLIO: 'portfolio',
  AVATAR: 'avatar',
  BIO: 'bio',
} as const;

export type StepId = typeof STEP_IDS[keyof typeof STEP_IDS];

export type RegisterFormData = {
  email: string;
  password: string;
  code: string;
  name: string;
  surname: string;
  birthDate: string;
  location: string;
  education: string;
  languages: string[];
  fields: string[];
  profession: string[];
  portfolio: string;
  portfolioFile: string;
  avatar: string;
  bio: string;
};

export type RegisterStepInstance = {
  validate: () => boolean;
};

export type RegisterStep = {
  id: StepId;
  component: Component;
  onAdvance?: (formData: RegisterFormData) => Promise<boolean> | boolean;
  /**
   * Optional steps render a "Skip for now" link above the action row. When
   * skipped, `onSkip` runs instead of `onAdvance` — typically just marking
   * the step complete server-side without persisting whatever the user
   * happened to type. Steps marked `optional: true` must provide `onSkip`.
   */
  optional?: boolean;
  onSkip?: (formData: RegisterFormData) => Promise<boolean> | boolean;
  /**
   * One-way doors. `onAdvance` has a non-idempotent side effect (creates an
   * account, verifies an email, etc.) and the user can't redo it. The wizard
   * hides the Back button on the *next* step so the user can't end up on a
   * step whose `onAdvance` would fail if re-fired.
   *
   * Reversible steps (the default) are safe to revisit — typically because
   * `onAdvance` is just a PATCH that overwrites the previous value.
   */
  irreversible?: boolean;
};

export const RegisterFormDataKey: InjectionKey<RegisterFormData> = Symbol('RegisterFormData');

/**
 * Single source of truth for every registration / onboarding step.
 * Pages (`/register`, `/user`) pick the subset they want from the returned record
 * and assemble their own steps array. Must be called from a setup context
 * (uses Pinia stores internally).
 */
export const useRegisterSteps = (): Record<StepId, RegisterStep> => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const appStore = useAppStore();

  return {
    [STEP_IDS.CREDENTIALS]: {
      id: STEP_IDS.CREDENTIALS,
      component: RegisterStepCredentials,
      irreversible: true, // POST /auth/register creates an account — can't be redone.
      onAdvance: async (data) => {
        return !!(await authStore.register(data.email, data.password));
      },
    },
    [STEP_IDS.CODE]: {
      id: STEP_IDS.CODE,
      component: RegisterStepCode,
      irreversible: true, // POST /auth/verify-email + auto-login — can't be redone.
      onAdvance: async (data) => {
        const verifyRes = await authStore.verifyEmail(data.email, data.code);
        if (verifyRes.error) {
          appStore.showMessage(apiErrorMessageKey(verifyRes.error), 'error');
          return false;
        }

        // rememberMe: true so subsequent steps have a refresh token —
        // without it the user only has a 15-minute access token, and
        // close-and-reopen mid-wizard would lock them out.
        const loginRes = await authStore.login(data.email, data.password, true);
        if (loginRes.error) {
          appStore.showMessage(apiErrorMessageKey(loginRes.error), 'error');
          return false;
        }

        return true;
      },
    },
    [STEP_IDS.NAME]: {
      id: STEP_IDS.NAME,
      component: RegisterStepName,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          firstName: data.name.trim(),
          lastName: data.surname.trim(),
          birthDate: data.birthDate,
          completeStep: STEP_IDS.NAME,
        }));
      },
    },
    [STEP_IDS.BACKGROUND]: {
      id: STEP_IDS.BACKGROUND,
      component: RegisterStepBackground,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          location: data.location.trim(),
          education: data.education.trim(),
          languages: data.languages,
          completeStep: STEP_IDS.BACKGROUND,
        }));
      },
    },
    [STEP_IDS.EXPERTISE]: {
      id: STEP_IDS.EXPERTISE,
      component: RegisterStepExpertise,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          fields: data.fields,
          profession: data.profession,
          completeStep: STEP_IDS.EXPERTISE,
        }));
      },
    },
    [STEP_IDS.PORTFOLIO]: {
      id: STEP_IDS.PORTFOLIO,
      component: RegisterStepPortfolio,
      optional: true,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          portfolio: data.portfolio.trim(),
          portfolioFile: data.portfolioFile,
          completeStep: STEP_IDS.PORTFOLIO,
        }));
      },
      onSkip: async () => {
        // Mark complete without persisting any typed-then-skipped values.
        // User can add a portfolio later from the profile edit page.
        return !!(await userStore.updateUser({
          completeStep: STEP_IDS.PORTFOLIO,
        }));
      },
    },
    [STEP_IDS.AVATAR]: {
      id: STEP_IDS.AVATAR,
      component: RegisterStepAvatar,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          avatar: data.avatar,
          completeStep: STEP_IDS.AVATAR,
        }));
      },
    },
    [STEP_IDS.BIO]: {
      id: STEP_IDS.BIO,
      component: RegisterStepBio,
      optional: true,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          bio: data.bio.trim(),
          completeStep: STEP_IDS.BIO,
        }));
      },
      onSkip: async () => {
        // Same pattern as portfolio: mark complete without persisting any
        // half-typed bio. User can fill it in later from the profile page.
        return !!(await userStore.updateUser({
          completeStep: STEP_IDS.BIO,
        }));
      },
    },
  };
};
