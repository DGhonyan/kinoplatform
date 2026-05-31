<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_bio_description') }}
    </p>

    <TextArea
      v-model="formData.bio"
      :placeholder="$t('register_bio_placeholder')"
      :error-messages="bioError"
      :counter="MAX_BIO_LENGTH"
      :maxlength="MAX_BIO_LENGTH"
      :rows="5"
      auto-grow
      hide-details="auto"
      required
      @update:model-value="bioError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const MAX_BIO_LENGTH = 1000;

const bioError = ref('');

const validate = (): boolean => {
  bioError.value = '';
  const value = formData.bio.trim();

  if (!value) {
    bioError.value = 'common_this_field_is_required';
    return false;
  }
  if (value.length > MAX_BIO_LENGTH) {
    bioError.value = 'register_bio_too_long';
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
