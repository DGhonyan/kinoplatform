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
    <DateInput
      v-model="formData.birthDate"
      :placeholder="$t('register_birth_date_placeholder')"
      :max="todayIsoDate"
      required
      :error-messages="birthDateError"
      hide-details="auto"
      prepend-icon="custom:birthday"
      @update:model-value="birthDateError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const { t } = useI18n();

const nameError = ref('');
const surnameError = ref('');
const birthDateError = ref('');

const todayIsoDate = new Date().toISOString().split('T')[0];

const validate = (): boolean => {
  nameError.value = '';
  surnameError.value = '';
  birthDateError.value = '';
  let ok = true;

  if (!formData.name.trim()) {
    nameError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!formData.surname.trim()) {
    surnameError.value = t('common_this_field_is_required');
    ok = false;
  }

  if (!formData.birthDate) {
    birthDateError.value = t('common_this_field_is_required');
    ok = false;
  }
  else {
    const date = new Date(formData.birthDate);
    if (Number.isNaN(date.getTime())) {
      birthDateError.value = t('register_invalid_birth_date');
      ok = false;
    }
    else if (date > new Date()) {
      birthDateError.value = t('register_birth_date_in_future');
      ok = false;
    }
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
