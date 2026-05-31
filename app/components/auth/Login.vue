<template>
  <div class="login-form">
    <Input
      v-model="email"
      type="email"
      :placeholder="$t('common_email')"
      required
      :error-messages="emailError"
      hide-details="auto"
      @update:model-value="emailError = ''"
    />
    <Input
      v-model="password"
      type="password"
      :placeholder="$t('common_password')"
      required
      :error-messages="passwordError"
      hide-details="auto"
      @update:model-value="passwordError = ''"
    />

    <div class="login-options">
      <v-checkbox
        v-model="rememberMe"
        :label="$t('common_remember_me')"
        density="compact"
        color="primary"
        hide-details
      />
      <NuxtLink
        to="/forgot-password"
        class="forgot-password-link"
      >
        {{ $t('auth_forgot_password') }}
      </NuxtLink>
    </div>

    <v-btn
      color="primary"
      rounded="pill"
      size="large"
      block
      @click="handleLogin"
    >
      {{ $t('common_login') }}
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();

const emit = defineEmits<{
  unverified: [email: string];
}>();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const emailError = ref('');
const passwordError = ref('');

const validate = (): boolean => {
  emailError.value = '';
  passwordError.value = '';
  let ok = true;

  if (!email.value.trim()) {
    emailError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!password.value) {
    passwordError.value = t('common_this_field_is_required');
    ok = false;
  }
  return ok;
};

const handleLogin = async () => {
  if (!validate()) return;

  const authStore = useAuthStore();
  const appStore = useAppStore();

  const res = await authStore.login(email.value, password.value, rememberMe.value);

  if (res.data) {
    navigateTo('/');
    return;
  }

  if (res.error?.code === ERROR_CODE.EMAIL_NOT_VERIFIED) {
    emit('unverified', email.value);
    return;
  }

  appStore.showMessage(res.error ? apiErrorMessageKey(res.error) : GENERIC_ERROR_KEY, 'error');
};
</script>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password-link {
  font-size: 14px;
  color: color(--v-theme-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
