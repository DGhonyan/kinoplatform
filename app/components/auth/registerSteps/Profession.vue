<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_profession_description') }}
    </p>

    <ChipPickerField
      v-model="formData.profession"
      :groups="PROFESSION_GROUPS"
      :title="$t('register_professions_title')"
      :placeholder="$t('register_professions_placeholder')"
      :search-placeholder="$t('register_professions_placeholder')"
      light
      :error="professionsError"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';
import { PROFESSION_GROUPS } from '~/utils/constants';
import ChipPickerField from '~/components/profile/popups/ChipPickerField.vue';

const formData = inject(RegisterFormDataKey)!;
const { t } = useI18n();

const professionsError = ref('');

const validate = (): boolean => {
  professionsError.value = '';

  if (formData.profession.length === 0) {
    professionsError.value = t('common_this_field_is_required');
    return false;
  }

  return true;
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
</style>
