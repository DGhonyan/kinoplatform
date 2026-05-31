<template>
  <div class="register-step">
    <div class="descriptions">
      <p class="description">
        {{ $t('register_credentials_description') }}
      </p>
      <p class="description small">
        {{ $t('register_password_requirements') }}
      </p>
    </div>

    <Input
      v-model="formData.email"
      type="email"
      :placeholder="$t('common_email')"
      required
      :error-messages="emailError"
      hide-details="auto"
      @update:model-value="emailError = ''"
    />
    <Input
      v-model="formData.password"
      type="password"
      :placeholder="$t('common_password')"
      required
      :error-messages="passwordError"
      hide-details="auto"
      @update:model-value="passwordError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const emailError = ref('');
const passwordError = ref('');

// Mirrors the backend's PASSWORD_REGEX in auth.dto.ts.
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

.description {
  text-align: center;
  font-size: 14px;
}

.description.small {
  font-size: 12px;
  color: color(--v-theme-gray);
}
</style>
