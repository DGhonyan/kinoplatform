<template>
  <div class="register-page">
    <Card>
      <AuthRegisterWizard
        :steps="steps"
        :title="$t('common_registration')"
        @completed="onCompleted"
      />

      <div class="footer">
        <span>{{ $t('register_already_have_account') }}</span>
        <NuxtLink
          to="/login"
          class="link"
        >
          {{ $t('common_login') }}
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import {
  STEP_IDS,
  useRegisterSteps,
  type RegisterFormData,
  type RegisterStep,
} from '~/components/auth/registerSteps';

definePageMeta({ layout: 'hero' });

const authStore = useAuthStore();
const appStore = useAppStore();

// If the user is already signed in we shouldn't start them at step 1 of registration.
// Active users go home; partially-onboarded users go to /user, where the wizard
// resumes with the remaining steps.
if (import.meta.client && authStore.user) {
  navigateTo(authStore.user.active ? '/' : '/user');
}

const stepConfigs = useRegisterSteps();
const steps: RegisterStep[] = [
  stepConfigs[STEP_IDS.CREDENTIALS],
  stepConfigs[STEP_IDS.CODE],
  stepConfigs[STEP_IDS.NAME],
  stepConfigs[STEP_IDS.BACKGROUND],
  stepConfigs[STEP_IDS.EXPERTISE],
  stepConfigs[STEP_IDS.PORTFOLIO],
  stepConfigs[STEP_IDS.AVATAR],
  stepConfigs[STEP_IDS.BIO],
];

// By the time the wizard emits `completed`, the user has been auto-logged-in
// in the Code step and their profile updated (with active: true server-side)
// in the Name step.
const onCompleted = (_data: RegisterFormData) => {
  appStore.showMessage('auth_registration_success', 'success');
  navigateTo('/');
};
</script>

<style scoped lang="scss">
.register-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $base-padding;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.link {
  color: color(--v-theme-primary);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
