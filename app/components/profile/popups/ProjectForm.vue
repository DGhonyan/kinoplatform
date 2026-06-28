<template>
  <div class="entity-form">
    <Input
      v-model="draft.name"
      color="accent"
      type="text"
      :label="'onboarding_project_name'"
      :placeholder="$t('onboarding_project_name')"
      required
      :error-messages="errors.name"
      hide-details="auto"
      @update:model-value="errors.name = ''"
    />
    <Select
      v-model="draft.type"
      color="accent"
      :label="'onboarding_project_type'"
      :placeholder="$t('onboarding_select_placeholder')"
      :items="productionTypeItems"
      required
      :error-messages="errors.type"
      @update:model-value="errors.type = ''"
    />
    <Select
      v-model="draft.position"
      color="accent"
      :label="'onboarding_project_position'"
      :placeholder="$t('register_professions_placeholder')"
      :items="professionItems"
      required
      :error-messages="errors.position"
      @update:model-value="errors.position = ''"
    />
    <div class="date-row">
      <Select
        v-model="draft.month"
        color="accent"
        :label="'onboarding_release_month'"
        :placeholder="$t('onboarding_month')"
        :items="months"
        required
        :error-messages="errors.date"
        @update:model-value="errors.date = ''"
      />
      <Select
        v-model="draft.year"
        color="accent"
        :label="'onboarding_release_year'"
        :placeholder="$t('onboarding_year')"
        :items="years"
        required
        :error-messages="errors.date"
        @update:model-value="errors.date = ''"
      />
    </div>
    <Input
      v-model="draft.link"
      color="accent"
      type="url"
      :label="'onboarding_project_link_optional'"
      :placeholder="$t('register_portfolio_link_placeholder')"
      :error-messages="errors.link"
      hide-details="auto"
      @update:model-value="errors.link = ''"
    />
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
import type { Project } from '~~/shared/types/user';
import { professions, PRODUCTION_TYPES } from '~/utils/constants';
import { monthOptions, yearOptions } from '~/utils/dateOptions';
import Select from '~/components/Select.vue';

/**
 * Reusable project form. Seeds an internal draft from `initial` (undefined = new)
 * and exposes `commit()` which validates and returns a Project, or null if
 * invalid. Shared by the onboarding popup and the profile's projects manager.
 */
const props = defineProps<{
  initial?: Project;
}>();

const { t, locale } = useI18n();

type ProjectDraft = {
  name: string;
  type: string;
  position: string;
  year: string;
  month: string;
  link: string;
  description: string;
};

const blank = (): ProjectDraft => ({
  name: '', type: '', position: '', year: '', month: '', link: '', description: '',
});

const draft = ref<ProjectDraft>(
  props.initial
    ? {
        name: props.initial.name,
        type: props.initial.type,
        position: props.initial.position,
        year: String(props.initial.year),
        month: String(props.initial.month),
        link: props.initial.link ?? '',
        description: props.initial.description ?? '',
      }
    : blank(),
);
const errors = reactive({ name: '', type: '', position: '', date: '', link: '' });

const professionItems = computed(() => professions.map(id => ({ value: id, title: t(id) })));
const productionTypeItems = computed(() => PRODUCTION_TYPES.map(id => ({ value: id, title: t(id) })));
const months = computed(() => monthOptions(locale.value));
const years = yearOptions();

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

const commit = (): Project | null => {
  errors.name = '';
  errors.type = '';
  errors.position = '';
  errors.date = '';
  errors.link = '';

  const d = draft.value;
  let ok = true;
  if (!d.name.trim()) {
    errors.name = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.type) {
    errors.type = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.position) {
    errors.position = t('common_this_field_is_required');
    ok = false;
  }
  if (!d.year || !d.month) {
    errors.date = t('common_this_field_is_required');
    ok = false;
  }

  // Be forgiving with a bare host (matches the portfolio-link field).
  const rawLink = d.link.trim();
  const normalizedLink = rawLink && !/^https?:\/\//i.test(rawLink) ? `https://${rawLink}` : rawLink;
  if (rawLink && !URL_RE.test(normalizedLink)) {
    errors.link = t('register_portfolio_invalid_url');
    ok = false;
  }
  if (!ok) return null;

  return {
    name: d.name.trim(),
    type: d.type,
    position: d.position,
    year: Number(d.year),
    month: Number(d.month),
    ...(normalizedLink ? { link: normalizedLink } : {}),
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
