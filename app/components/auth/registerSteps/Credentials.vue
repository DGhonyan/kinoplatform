<template>
  <div class="register-step">
    <div class="descriptions">
      <p class="description">
        {{ $t('register_credentials_description') }}
      </p>
    </div>

    <Input
      v-model="formData.email"
      prepend-inner-icon="custom:mail"
      type="email"
      :placeholder="$t('common_email')"
      required
      :error-messages="emailError"
      hide-details="auto"
      @update:model-value="emailError = ''"
    />
    <Input
      v-model="formData.password"
      prepend-inner-icon="custom:lock"
      type="password"
      :placeholder="$t('common_password')"
      required
      :error-messages="passwordError"
      hide-details="auto"
      persistent-hint
      :hint="$t('register_password_requirements')"
      @update:model-value="passwordError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const emailError = ref('');
const passwordError = ref('');

// Mirrors the backend's PASSWORD_REGEX in auth.dto.ts. backend one doesn't need length limits as it has decorators.
// const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/;

const validate = (): boolean => {
  emailError.value = '';
  passwordError.value = '';
  let ok = true;

  const email = formData.email.trim();
  if (!email) {
    emailError.value = 'common_this_field_is_required';
    ok = false;
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.value = 'auth_invalid_email';
    ok = false;
  }

  if (!formData.password) {
    passwordError.value = 'common_this_field_is_required';
    ok = false;
  }
  else if (!PASSWORD_RE.test(formData.password)) {
    passwordError.value = 'register_password_requirements';
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

.descriptions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
