import type { Component, InjectionKey } from 'vue';
import type { Gender } from '~~/shared/types/user';
import { STEP_IDS, type WizardStepId } from '~/utils/onboarding';
import RegisterStepCredentials from './registerSteps/Credentials.vue';
import RegisterStepCode from './registerSteps/Code.vue';
import RegisterStepName from './registerSteps/Name.vue';
import RegisterStepLocation from './registerSteps/Location.vue';
import RegisterStepProfession from './registerSteps/Profession.vue';

// Re-exported for component-layer callers. Always-loaded consumers (middleware,
// Header) import '~/utils/onboarding' directly to avoid bundling the step SFCs.
export {
  STEP_IDS,
  WIZARD_STEP_IDS,
  REQUIRED_ONBOARDING_STEPS,
  isOnboardingComplete,
} from '~/utils/onboarding';
export type { StepId, WizardStepId } from '~/utils/onboarding';

export type RegisterFormData = {
  email: string;
  password: string;
  code: string;
  name: string;
  surname: string;
  // null (not '') is the "unselected" sentinel — Vuetify's Select treats '' as a
  // selected value and hides the placeholder.
  gender: Gender | null;
  location: string;
  birthDate: string;
  profession: string[];
};

export type RegisterStepInstance = {
  validate: () => boolean;
};

export type RegisterStep = {
  id: WizardStepId;
  component: Component;
  onAdvance?: (formData: RegisterFormData) => Promise<boolean> | boolean;
  // Optional steps render "Skip for now" and run `onSkip` instead of `onAdvance`,
  // so `optional: true` requires an `onSkip`.
  optional?: boolean;
  onSkip?: (formData: RegisterFormData) => Promise<boolean> | boolean;
  // One-way door: `onAdvance` has a non-idempotent side effect (creates an
  // account, verifies an email), so the wizard hides Back on the NEXT step.
  irreversible?: boolean;
};

export const RegisterFormDataKey: InjectionKey<RegisterFormData> = Symbol('RegisterFormData');

// The registration wizard steps; pages pick the subset they want. Must be called
// from a setup context (uses Pinia stores).
export const useRegisterSteps = (): Record<WizardStepId, RegisterStep> => {
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

        // rememberMe so later steps have a refresh token; otherwise a 15-minute
        // access token means close-and-reopen mid-wizard locks the user out.
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
          gender: data.gender || undefined,
          completeStep: STEP_IDS.NAME,
        }));
      },
    },
    [STEP_IDS.LOCATION]: {
      id: STEP_IDS.LOCATION,
      component: RegisterStepLocation,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          location: data.location.trim(),
          birthDate: data.birthDate,
          completeStep: STEP_IDS.LOCATION,
        }));
      },
    },
    [STEP_IDS.PROFESSION]: {
      id: STEP_IDS.PROFESSION,
      component: RegisterStepProfession,
      onAdvance: async (data) => {
        return !!(await userStore.updateUser({
          profession: data.profession,
          completeStep: STEP_IDS.PROFESSION,
        }));
      },
    },
  };
};
