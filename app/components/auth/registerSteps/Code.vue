<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_code_description') }}
    </p>

    <Input
      v-model="formData.code"
      type="text"
      :placeholder="$t('register_code_placeholder')"
      required
      maxlength="6"
      inputmode="numeric"
      :error-messages="codeError"
      hide-details="auto"
      text-position="center"
      @update:model-value="codeError = ''"
    />

    <div class="extras">
      <span>{{ $t('register_didnt_receive_code') }}</span>
      <Button
        variant="text"
        color="primary"
        size="small"
        :loading="resending"
        @click="handleResend"
      >
        {{ $t('register_resend') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const appStore = useAppStore();
const authStore = useAuthStore();

const codeError = ref('');
const resending = ref(false);

const validate = (): boolean => {
  codeError.value = '';
  const value = formData.code.trim();
  if (!value) {
    codeError.value = 'common_this_field_is_required';
    return false;
  }
  if (!/^\d{6}$/.test(value)) {
    codeError.value = 'register_invalid_code';
    return false;
  }
  return true;
};

const handleResend = async () => {
  if (!formData.email) return;
  resending.value = true;
  const ok = await authStore.resendVerification(formData.email);
  resending.value = false;
  appStore.showMessage(
    ok ? 'auth_verification_resent' : 'auth_verification_resend_failed',
    ok ? 'success' : 'error',
  );
};

onMounted(async () => {
  await nextTick();
  (document.querySelector('.register-step input') as HTMLInputElement)?.focus();
});
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

.extras {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
</style>
