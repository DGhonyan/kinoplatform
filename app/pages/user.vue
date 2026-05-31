<template>
  <div class="profile">
    <template v-if="showOnboarding">
      <Card>
        <AuthRegisterWizard
          :steps="remainingSteps"
          :title="$t('onboarding_complete_profile')"
          :initial-form-data="initialFormData"
          :progress-total="totalOnboardingSteps"
          :progress-offset="progressOffset"
          @completed="onCompleted"
        />
      </Card>
    </template>
    <UserProfile
      v-else
      :user-id="undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  STEP_IDS,
  useRegisterSteps,
  type RegisterFormData,
  type RegisterStep,
} from '~/components/auth/registerSteps';

const authStore = useAuthStore();
const appStore = useAppStore();
const { user } = storeToRefs(authStore);

// Post-verification onboarding steps shown on /user. Add new step ids here as
// the flow grows; the wizard renders only those not yet in user.completedSteps.
const stepConfigs = useRegisterSteps();
const allSteps: RegisterStep[] = [
  stepConfigs[STEP_IDS.NAME],
  stepConfigs[STEP_IDS.BACKGROUND],
  stepConfigs[STEP_IDS.EXPERTISE],
  stepConfigs[STEP_IDS.PORTFOLIO],
  stepConfigs[STEP_IDS.AVATAR],
  stepConfigs[STEP_IDS.BIO],
];

// Snapshot at mount — do NOT make this reactive. `user.completedSteps` grows
// every time a wizard step finishes, and a reactive `remainingSteps` would
// shrink under the wizard's feet between steps. `currentIndex += 1` would
// then land on the wrong step (e.g. portfolio skip would jump to bio,
// skipping avatar). Snapshot once; the wizard remounts on full page reload
// if the user comes back later.
const completedAtMount = new Set(user.value?.completedSteps ?? []);
const remainingSteps: RegisterStep[] = allSteps.filter(s => !completedAtMount.has(s.id));

// Progress is shown against the FULL onboarding flow (credentials + code +
// the 6 post-auth steps = 8), not just this page's slice. The user mentally
// went through one wizard — "step 6 of 8" is more honest than "step 4 of 6".
const totalOnboardingSteps = Object.keys(STEP_IDS).length;
const progressOffset = totalOnboardingSteps - remainingSteps.length;

const showOnboarding = computed(() =>
  Boolean(user.value && !user.value.active && remainingSteps.length > 0),
);

watch(showOnboarding, (newVal) => {
  if (newVal) {
    setPageLayout('hero');
  }
  else {
    setPageLayout('default');
  }
}, { immediate: true });

const initialFormData = computed<Partial<RegisterFormData>>(() => ({
  email: user.value?.email ?? '',
  name: user.value?.firstName ?? '',
  surname: user.value?.lastName ?? '',
  birthDate: user.value?.birthDate ?? '',
  location: user.value?.location ?? '',
  education: user.value?.education ?? '',
  languages: user.value?.languages ?? [],
  fields: user.value?.fields ?? [],
  profession: user.value?.profession ?? [],
  portfolio: user.value?.portfolio ?? '',
  portfolioFile: user.value?.portfolioFile ?? '',
  avatar: user.value?.avatar ?? '',
  bio: user.value?.bio ?? '',
}));

const onCompleted = (_data: RegisterFormData) => {
  appStore.showMessage('auth_registration_success', 'success');
  navigateTo('/');
};
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
