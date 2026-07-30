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
      <ActorDetailsPopup
        v-if="actorDetailsOpen"
        v-model="actorDetailsOpen"
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
import ActorDetailsPopup from '~/components/profile/popups/ActorDetailsPopup.vue';
import { needsActorDetails } from '~/utils/persona';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Credentials + Code are always done by login, so the resume wizard offers only
// the three profile steps; the required essentials popup takes over afterwards.
const stepConfigs = useRegisterSteps();
const wizardStepList: RegisterStep[] = [
  stepConfigs[STEP_IDS.NAME],
  stepConfigs[STEP_IDS.LOCATION],
  stepConfigs[STEP_IDS.PROFESSION],
];

// Keep all three steps so Back can revise a completed one (idempotent PATCHes);
// snapshot at mount so currentIndex never misaligns as completedSteps grows.
const completedAtMount = new Set(user.value?.completedSteps ?? []);
const firstIncompleteIndex = Math.max(
  0,
  wizardStepList.findIndex(s => !completedAtMount.has(s.id)),
);

// Progress spans the whole 5-step wizard, so a resuming user sees "4 of 5".
const progressTotal = WIZARD_STEP_IDS.length;
const progressOffset = WIZARD_STEP_IDS.length - wizardStepList.length;

const allWizardStepsDone = wizardStepList.every(s => completedAtMount.has(s.id));
const phase = ref<'wizard' | 'profile'>(allWizardStepsDone ? 'profile' : 'wizard');
const essentialsOpen = ref(false);
const actorDetailsOpen = ref(false);

const essentialsDone = () => (user.value?.completedSteps ?? []).includes(STEP_IDS.ESSENTIALS);

// Essentials (required) takes precedence; once done, an actor still missing the
// mandatory appearance/photos gets the actor-details popup instead.
const maybeForcePopups = () => {
  if (phase.value !== 'profile') return;

  if (!essentialsDone()) {
    essentialsOpen.value = true;
    return;
  }

  if (needsActorDetails(user.value)) {
    actorDetailsOpen.value = true;
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
  nextTick(maybeForcePopups);
};

const onEssentialsCompleted = () => {
  essentialsOpen.value = false;
};

// Hero look while the wizard runs; the regular profile uses the default layout.
watch(phase, (p) => {
  setPageLayout(p === 'wizard' ? 'hero' : 'default');
}, { immediate: true });

// Nuxt does NOT reset an imperative setPageLayout when the next route declares
// no layout — without this the hero cover bleeds onto the next page.
onBeforeRouteLeave(() => {
  setPageLayout('default');
});

onMounted(maybeForcePopups);

// A post-onboarding profession edit can make a crew user an actor lacking
// appearance/photos; `user` is replaced wholesale, so a shallow watch catches it.
watch(user, () => nextTick(maybeForcePopups));
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
