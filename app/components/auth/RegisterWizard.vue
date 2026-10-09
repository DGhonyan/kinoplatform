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
        <!-- Back icon appears only on optional steps, where Skip displaces Back from the actions row. -->
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

      <!-- Real <form> so Enter submits the step; only Next is type="submit". -->
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
    // Total step count in the full flow — pass when `steps` is a filtered
    // subset (resume flow) so the progress bar reflects the true position.
    progressTotal?: number;
    /** Steps already completed before this wizard mounted (resume flow). */
    progressOffset?: number;
    // Step index to start on — the resume flow lands on the first incomplete
    // step while keeping earlier reversible steps so Back still works.
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
  acceptPrivacy: false,
  marketingConsent: false,
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

// Back is hidden when the previous step is irreversible (credentials, code) —
// re-firing their non-idempotent `onAdvance` would error.
const canGoBack = computed(() => {
  if (currentIndex.value === 0) return false;
  const previousStep = props.steps[currentIndex.value - 1];
  return !previousStep?.irreversible;
});

const next = async () => {
  // Guard re-entry: Enter submits bypass the button's loading state and could
  // re-fire an irreversible step before the first finishes.
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

// Skip bypasses validation by design; `onSkip` still runs so the step is
// marked complete server-side and not re-prompted on resume.
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
  color: color(--v-theme-primary);
}

// Each step renders its prompt as `.description`; the look is owned here in
// ONE place so steps never hardcode it.
.wizard-form :deep(.description) {
  margin: 0;
  text-align: center;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 16px;

  > * {
    flex: 1;
  }
}
</style>
