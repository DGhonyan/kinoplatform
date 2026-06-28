<template>
  <v-defaults-provider
    :defaults="{
      VTextField: { bgColor: 'accent' },
      VTextarea: { bgColor: 'accent' },
      VAutocomplete: { bgColor: 'accent' },
      VFileInput: { bgColor: 'accent' },
    }"
  >
    <div class="register-wizard">
      <div class="header">
        <!--
        Top-left back icon only appears on optional steps, where Skip has
        displaced Back from the actions row. On non-optional steps Back keeps
        its original slot in the actions row.
      -->
        <Button
          v-if="canGoBack && currentStep.optional"
          class="back-icon"
          variant="text"
          icon="mdi-chevron-left"
          size="small"
          :disabled="busy"
          :aria-label="$t('common_go_back')"
          @click="back"
        />
        <h2
          v-if="title"
          class="title"
        >
          {{ title }}
        </h2>
      </div>

      <!-- A real <form> so Enter submits the step. Only Next is type="submit";
         Skip/Back are type="button" so they never submit on Enter or click. -->
      <form
        class="wizard-form"
        @submit.prevent="next"
      >
        <component
          :is="currentStep.component"
          ref="stepRef"
        />

        <div class="actions">
          <!-- Optional step → Skip occupies the secondary slot. -->
          <Button
            v-if="currentStep.optional"
            type="button"
            variant="outlined"
            color="primary"
            rounded="pill"
            size="large"
            :disabled="busy"
            @click="skip"
          >
            {{ $t('common_skip_for_now') }}
          </Button>
          <!-- Non-optional step → Back occupies the secondary slot (when available). -->
          <Button
            v-else-if="canGoBack"
            type="button"
            variant="outlined"
            color="primary"
            rounded="pill"
            size="large"
            :disabled="busy"
            @click="back"
          >
            {{ $t('common_go_back') }}
          </Button>
          <Button
            type="submit"
            color="primary"
            rounded="pill"
            size="large"
            :loading="busy"
          >
            {{ isLastStep ? $t('common_finish') : $t('common_next') }}
          </Button>
        </div>
      </form>

      <AuthRegisterProgress
        v-if="effectiveProgressCurrent > 0"
        :total="effectiveProgressTotal"
        :current="effectiveProgressCurrent"
      />
    </div>
  </v-defaults-provider>
</template>

<script lang="ts" setup>
import {
  RegisterFormDataKey,
  type RegisterFormData,
  type RegisterStep,
  type RegisterStepInstance,
} from './registerSteps';

const props = withDefaults(
  defineProps<{
    steps: RegisterStep[];
    title?: string;
    initialFormData?: Partial<RegisterFormData>;
    /**
     * Total step count in the full flow. Defaults to `steps.length`. Pass this
     * when `steps` is a filtered subset (resumption flow on /user) so the
     * progress bar reflects the user's true position in the wizard, not their
     * position within the remaining tail.
     */
    progressTotal?: number;
    /**
     * Number of steps already completed before this wizard mounted. Combined
     * with `currentIndex` to compute the true progress position. Defaults to 0.
     */
    progressOffset?: number;
    /**
     * Step index to start on. Used by the resume flow (/user) to land on the
     * first incomplete step while keeping earlier (completed, reversible) steps
     * in the array so Back still works.
     */
    initialIndex?: number;
  }>(),
  {
    title: '',
    initialFormData: () => ({}),
    progressTotal: undefined,
    progressOffset: 0,
    initialIndex: 0,
  },
);

const emit = defineEmits<{
  completed: [data: RegisterFormData];
}>();

const formData = reactive<RegisterFormData>({
  email: '',
  password: '',
  code: '',
  name: '',
  surname: '',
  gender: null,
  location: '',
  birthDate: '',
  profession: [],
  ...props.initialFormData,
});

provide(RegisterFormDataKey, formData);

const currentIndex = ref(props.initialIndex);
const busy = ref(false);
const stepRef = ref<RegisterStepInstance | null>(null);

const currentStep = computed(() => props.steps[currentIndex.value]!);
const isLastStep = computed(() => currentIndex.value === props.steps.length - 1);

const effectiveProgressTotal = computed(() => props.progressTotal ?? props.steps.length);
const effectiveProgressCurrent = computed(() => props.progressOffset + currentIndex.value);

// You can go back only if the previous step is reversible. Irreversible steps
// (credentials, code) have non-idempotent side effects (account creation, email
// verification), so re-firing their `onAdvance` would error — better to hide
// Back than to let the user walk into that wall.
const canGoBack = computed(() => {
  if (currentIndex.value === 0) return false;
  const previousStep = props.steps[currentIndex.value - 1];
  return !previousStep?.irreversible;
});

const next = async () => {
  // Guard re-entry: a <form> submit on Enter bypasses the button's loading
  // state, so a second Enter could re-fire an irreversible step (account
  // creation / email verification) before the first finishes.
  if (busy.value) return;
  if (!stepRef.value?.validate()) return;

  busy.value = true;
  try {
    const ok = (await currentStep.value.onAdvance?.(formData)) ?? true;
    if (!ok) return;

    if (isLastStep.value) {
      emit('completed', { ...formData });
      return;
    }

    currentIndex.value += 1;
  }
  finally {
    busy.value = false;
  }
};

// Skip bypasses validation by design — the user is opting out of providing
// this step's data. We still call `onSkip` so the step can be marked complete
// server-side and the user isn't re-prompted on resumption.
const skip = async () => {
  if (!currentStep.value.optional) return;

  busy.value = true;
  try {
    const ok = (await currentStep.value.onSkip?.(formData)) ?? true;
    if (!ok) return;

    if (isLastStep.value) {
      emit('completed', { ...formData });
      return;
    }

    currentIndex.value += 1;
  }
  finally {
    busy.value = false;
  }
};

const back = () => {
  if (canGoBack.value) currentIndex.value -= 1;
};
</script>

<style scoped lang="scss">
.register-wizard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// The form wraps the step + actions; keep the same column spacing the wizard had.
.wizard-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// Position the back icon absolutely so it sits at the top-left of the card
// without nudging the centered title off-axis.
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.back-icon {
  position: absolute;
  left: 0;
}

.title {
  text-align: center;
  margin: 0;
}

.actions {
  display: flex;
  gap: 16px;

  > * {
    flex: 1;
  }
}
</style>
