<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_avatar_description') }}
    </p>

    <FileUpload
      v-model="formData.avatar"
      accept="image/*"
      placeholder="personal_info_upload_photo"
      helper-text="personal_info_upload_photo_helper_text"
      @update:model-value="avatarError = ''"
    />

    <p
      v-if="avatarError"
      class="form-error"
    >
      {{ avatarError }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;
const { t } = useI18n();

const avatarError = ref('');

const validate = (): boolean => {
  avatarError.value = '';
  if (!formData.avatar) {
    avatarError.value = t('register_avatar_required');
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

.form-error {
  color: rgb(var(--v-theme-error));
  font-size: 12px;
  text-align: center;
}
</style>
