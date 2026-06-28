<template>
  <div class="entity-form">
    <Input
      v-model="draft.position"
      color="accent"
      type="text"
      :label="'onboarding_experience_position'"
      :placeholder="$t('onboarding_experience_position')"
      required
      :error-messages="errors.position"
      hide-details="auto"
      @update:model-value="errors.position = ''"
    />
    <Input
      v-model="draft.company"
      color="accent"
      type="text"
      :label="'onboarding_experience_company'"
      :placeholder="$t('onboarding_experience_company')"
      required
      :error-messages="errors.company"
      hide-details="auto"
      @update:model-value="errors.company = ''"
    />
    <Select
      v-model="draft.employmentType"
      color="accent"
      :label="'onboarding_employment_type'"
      :placeholder="$t('onboarding_select_placeholder')"
      :items="employmentItems"
      required
      :error-messages="errors.employmentType"
      @update:model-value="errors.employmentType = ''"
    />

    <div class="date-row">
      <Select
        v-model="draft.startMonth"
        color="accent"
        :label="'onboarding_start_month'"
        :placeholder="$t('onboarding_month')"
        :items="months"
        required
        :error-messages="errors.start"
        @update:model-value="errors.start = ''"
      />
      <Select
        v-model="draft.startYear"
        color="accent"
        :label="'onboarding_start_year'"
        :placeholder="$t('onboarding_year')"
        :items="years"
        required
        :error-messages="errors.start"
        @update:model-value="errors.start = ''"
      />
    </div>

    <v-checkbox
      v-model="draft.currentlyWorking"
      color="accent"
      density="compact"
      hide-details
      :label="$t('onboarding_currently_working')"
    />

    <div
      v-if="!draft.currentlyWorking"
      class="date-row"
    >
      <Select
        v-model="draft.endMonth"
        color="accent"
        :label="'onboarding_end_month'"
        :placeholder="$t('onboarding_month')"
        :items="months"
        required
        :error-messages="errors.end"
        @update:model-value="errors.end = ''"
      />
      <Select
        v-model="draft.endYear"
        color="accent"
        :label="'onboarding_end_year'"
        :placeholder="$t('onboarding_year')"
        :items="years"
        required
        :error-messages="errors.end"
        @update:model-value="errors.end = ''"
      />
    </div>

    <TextArea
      v-model="draft.description"
      color="accent"
      :label="'onboarding_description_optional'"
      :rows="3"
      auto-grow
      hide-details="auto"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Experience } from '~~/shared/types/user';
import { EMPLOYMENT_TYPES } from '~/utils/constants';
import { monthOptions, yearOptions } from '~/utils/dateOptions';
import Select from '~/components/Select.vue';

/**
 * Reusable work-experience form. Seeds an internal draft from `initial`
 * (undefined = new) and exposes `commit()` which validates and returns an
 * Experience, or null if invalid. Shared by the onboarding popup and the
 * profile's experience manager.
 */
const props = defineProps<{
  initial?: Experience;
}>();

const { t, locale } = useI18n();

type ExperienceDraft = {
  position: string;
  company: string;
  employmentType: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  currentlyWorking: boolean;
  description: string;
};

const blank = (): ExperienceDraft => ({
  position: '', company: '', employmentType: '',
  startYear: '', startMonth: '', endYear: '', endMonth: '',
  currentlyWorking: false, description: '',
});

const draft = ref<ExperienceDraft>(
  props.initial
    ? {
        position: props.initial.position,
        company: props.initial.company,
        employmentType: props.initial.employmentType,
        startYear: String(props.initial.startYear),
        startMonth: String(props.initial.startMonth),
        endYear: props.initial.endYear != null ? String(props.initial.endYear) : '',
        endMonth: props.initial.endMonth != null ? String(props.initial.endMonth) : '',
        currentlyWorking: props.initial.currentlyWorking,
        description: props.initial.description ?? '',
      }
    : blank(),
);
const errors = reactive({ position: '', company: '', employmentType: '', start: '', end: '' });

const employmentItems = computed(() => EMPLOYMENT_TYPES.map(id => ({ value: id, title: t(id) })));
const months = computed(() => monthOptions(locale.value));
const years = yearOptions();

const commit = (): Experience | null => {
  errors.position = '';
  errors.company = '';
  errors.employmentType = '';
  errors.start = '';
  errors.end = '';

  const d = draft.value;
  let ok = true;
  if (!d.position.trim()) {
    errors.position = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.company.trim()) {
    errors.company = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.employmentType) {
    errors.employmentType = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.startYear || !d.startMonth) {
    errors.start = t('common_this_field_is_required');
    ok = false;
  }

  if (!d.currentlyWorking) {
    if (!d.endYear || !d.endMonth) {
      errors.end = t('common_this_field_is_required');
      ok = false;
    }
    else if (
      d.startYear && d.startMonth
      && (Number(d.endYear) < Number(d.startYear)
        || (Number(d.endYear) === Number(d.startYear) && Number(d.endMonth) < Number(d.startMonth)))
    ) {
      errors.end = t('onboarding_end_before_start');
      ok = false;
    }
  }
  if (!ok) return null;

  return {
    position: d.position.trim(),
    company: d.company.trim(),
    employmentType: d.employmentType,
    startYear: Number(d.startYear),
    startMonth: Number(d.startMonth),
    currentlyWorking: d.currentlyWorking,
    ...(d.currentlyWorking ? {} : { endYear: Number(d.endYear), endMonth: Number(d.endMonth) }),
    ...(d.description.trim() ? { description: d.description.trim() } : {}),
  };
};

defineExpose({ commit });
</script>

<style scoped lang="scss">
.entity-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-row {
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
  }
}
</style>
