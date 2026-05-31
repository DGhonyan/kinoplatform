<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_expertise_description') }}
    </p>

    <v-autocomplete
      v-model="formData.fields"
      class="multi-select"
      variant="outlined"
      color="primary"
      base-color="grey"
      :placeholder="$t('register_fields_placeholder')"
      :items="fieldItems"
      :error-messages="fieldsError"
      :no-data-text="$t('register_no_matches')"
      hide-details="auto"
      multiple
      chips
      closable-chips
      autocomplete="suppress"
      @update:model-value="fieldsError = ''"
    />

    <v-autocomplete
      v-model="formData.profession"
      class="multi-select"
      variant="outlined"
      color="primary"
      base-color="grey"
      :placeholder="$t('register_professions_placeholder')"
      :items="professionItems"
      :error-messages="professionsError"
      :no-data-text="$t('register_no_matches')"
      hide-details="auto"
      multiple
      chips
      closable-chips
      autocomplete="suppress"
      @update:model-value="professionsError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';
import { FIELD_IDS, professions } from '~/utils/constants';

const formData = inject(RegisterFormDataKey)!;
const { t } = useI18n();

const fieldsError = ref('');
const professionsError = ref('');

// Order in FIELD_IDS / professions is intentional (production-phase grouping
// for fields, role clusters for professions). Don't re-sort — users can
// search to find what they want.
const fieldItems = computed(() =>
  FIELD_IDS.map(id => ({ value: id, title: t(id) })),
);
const professionItems = computed(() =>
  professions.map(id => ({ value: id, title: t(id) })),
);

const validate = (): boolean => {
  fieldsError.value = '';
  professionsError.value = '';
  let ok = true;

  if (formData.fields.length === 0) {
    fieldsError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (formData.profession.length === 0) {
    professionsError.value = t('common_this_field_is_required');
    ok = false;
  }

  return ok;
};

defineExpose({ validate });
</script>

<style scoped lang="scss">
.register-step {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description {
  text-align: center;
  font-size: 14px;
}

.multi-select :deep(.v-field) {
  border-radius: 16px;
}

:deep(.v-input__details) {
  padding: 0 !important;
}
</style>
