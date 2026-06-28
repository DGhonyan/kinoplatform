<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_name_description') }}
    </p>

    <Input
      v-model="formData.name"
      type="text"
      :placeholder="$t('common_first_name')"
      required
      :error-messages="nameError"
      hide-details="auto"
      @update:model-value="nameError = ''"
    />
    <Input
      v-model="formData.surname"
      type="text"
      :placeholder="$t('common_last_name')"
      required
      :error-messages="surnameError"
      hide-details="auto"
      @update:model-value="surnameError = ''"
    />

    <Select
      v-model="formData.gender"
      :placeholder="$t('onboarding_select_placeholder')"
      :items="genders"
      :error-messages="genderError"
      @update:model-value="genderError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';
import { GENDERS } from '~/utils/constants';

const { t } = useI18n();
const genders = computed(() => GENDERS.map(g => ({ title: t(`gender_${g}`), value: g })));
const formData = inject(RegisterFormDataKey)!;

const nameError = ref('');
const surnameError = ref('');
const genderError = ref('');

const validate = (): boolean => {
  nameError.value = '';
  surnameError.value = '';
  genderError.value = '';
  let ok = true;

  if (!formData.name.trim()) {
    nameError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!formData.surname.trim()) {
    surnameError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!formData.gender) {
    genderError.value = t('common_this_field_is_required');
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
</style>
