<template>
  <div class="profile">
    <div
      v-if="phase === 'wizard'"
      class="onboarding"
    >
      <Card>
        <AuthRegisterWizard
          :steps="wizardStepList"
          :title="$t('onboarding_complete_profile')"
          :initial-form-data="initialFormData"
          :initial-index="firstIncompleteIndex"
          :progress-total="progressTotal"
          :progress-offset="progressOffset"
          @completed="onWizardCompleted"
        />
      </Card>
    </div>

    <template v-else>
      <UserProfile :user-id="undefined" />
      <EssentialsPopup
        v-if="essentialsOpen"
        v-model="essentialsOpen"
        @completed="onEssentialsCompleted"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  STEP_IDS,
  WIZARD_STEP_IDS,
  useRegisterSteps,
  type RegisterFormData,
  type RegisterStep,
} from '~/components/auth/registerSteps';
import EssentialsPopup from '~/components/profile/popups/EssentialsPopup.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// The wizard on /user resumes the post-auth required steps. Credentials + Code
// are always done by the time the user is logged in, so we only offer the three
// profile steps; the required "essentials" popup (photo/bio/languages) takes
// over afterwards.
const stepConfigs = useRegisterSteps();
const wizardStepList: RegisterStep[] = [
  stepConfigs[STEP_IDS.NAME],
  stepConfigs[STEP_IDS.LOCATION],
  stepConfigs[STEP_IDS.PROFESSION],
];

// Keep ALL three reversible steps in the array (don't filter completed ones out)
// and just start on the first incomplete one — so a resuming user can still go
// Back to revise an already-completed step (each is an idempotent PATCH).
// Snapshot at mount — completedSteps grows as steps finish, but the array stays
// fixed so currentIndex never misaligns.
const completedAtMount = new Set(user.value?.completedSteps ?? []);
const firstIncompleteIndex = Math.max(
  0,
  wizardStepList.findIndex(s => !completedAtMount.has(s.id)),
);

// Progress reflects the whole 5-step wizard (credentials + code + these three),
// so a resuming user sees "step 4 of 5", not "step 1 of 3". credentials + code
// are always done here, so the offset is constant.
const progressTotal = WIZARD_STEP_IDS.length;
const progressOffset = WIZARD_STEP_IDS.length - wizardStepList.length;

// Wizard phase if any of the three steps is still incomplete.
const allWizardStepsDone = wizardStepList.every(s => completedAtMount.has(s.id));
const phase = ref<'wizard' | 'profile'>(allWizardStepsDone ? 'profile' : 'wizard');
const essentialsOpen = ref(false);

const essentialsDone = () => (user.value?.completedSteps ?? []).includes(STEP_IDS.ESSENTIALS);

const maybeOpenEssentials = () => {
  if (phase.value === 'profile' && !essentialsDone()) {
    essentialsOpen.value = true;
  }
};

const initialFormData = computed<Partial<RegisterFormData>>(() => ({
  email: user.value?.email ?? '',
  name: user.value?.firstName ?? '',
  surname: user.value?.lastName ?? '',
  gender: user.value?.gender ?? null,
  location: user.value?.location ?? '',
  birthDate: user.value?.birthDate ?? '',
  profession: user.value?.profession ?? [],
}));

const onWizardCompleted = () => {
  phase.value = 'profile';
  nextTick(maybeOpenEssentials);
};

const onEssentialsCompleted = () => {
  essentialsOpen.value = false;
};

// Onboarding wants the hero look (cover image + white card) while the wizard
// runs; the regular profile uses the default layout.
watch(phase, (p) => {
  setPageLayout(p === 'wizard' ? 'hero' : 'default');
}, { immediate: true });

onMounted(maybeOpenEssentials);
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.onboarding {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
