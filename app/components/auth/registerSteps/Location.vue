<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_location_description') }}
    </p>

    <Input
      v-model="formData.location"
      type="text"
      :placeholder="$t('register_location_placeholder')"
      required
      prepend-inner-icon="custom:map-pin"
      :error-messages="locationError"
      hide-details="auto"
      @update:model-value="locationError = ''"
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

const locationError = ref('');
const birthDateError = ref('');

const todayIsoDate = new Date().toISOString().split('T')[0];

const validate = (): boolean => {
  locationError.value = '';
  birthDateError.value = '';
  let ok = true;

  if (!formData.location.trim()) {
    locationError.value = t('common_this_field_is_required');
    ok = false;
  }

  if (!formData.birthDate) {
    birthDateError.value = t('common_this_field_is_required');
    ok = false;
  }
  else {
    const date = new Date(formData.birthDate);
    // Latest birth date that still makes the user at least 16 (mirrors the
    // backend's @MinAge(16) so they get an inline error, not a 400).
    const minAgeCutoff = new Date();
    minAgeCutoff.setFullYear(minAgeCutoff.getFullYear() - 16);

    if (Number.isNaN(date.getTime())) {
      birthDateError.value = t('register_invalid_birth_date');
      ok = false;
    }
    else if (date > new Date()) {
      birthDateError.value = t('register_birth_date_in_future');
      ok = false;
    }
    else if (date > minAgeCutoff) {
      birthDateError.value = t('register_min_age');
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
