<template>
  <div class="reset-password">
    <div class="content">
      <div class="form-card">
        <template v-if="success">
          <v-icon
            color="success"
            size="48"
          >
            mdi-check-circle-outline
          </v-icon>
          <h2>{{ $t('auth_password_reset_success') }}</h2>
          <p>{{ $t('auth_password_reset_success_description') }}</p>
          <v-btn
            color="primary"
            @click="navigateTo('/login')"
          >
            {{ $t('common_login') }}
          </v-btn>
        </template>

        <template v-else>
          <h2>{{ $t('auth_reset_password') }}</h2>

          <Input
            v-model="password"
            type="password"
            label="auth_new_password"
            required
            :error-messages="passwordError"
            hide-details="auto"
          />

          <Input
            v-model="confirmPassword"
            type="password"
            label="common_confirm_password"
            required
            :error-messages="confirmPasswordError"
            hide-details="auto"
          />

          <v-btn
            color="primary"
            :loading="loading"
            @click="handleReset"
          >
            {{ $t('auth_reset_password') }}
          </v-btn>
        </template>

        <NuxtLink
          to="/login"
          class="back-link"
        >{{ $t('auth_back_to_login') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'auth' });

const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const loading = ref(false);
const success = ref(false);

const handleReset = async () => {
  passwordError.value = '';
  confirmPasswordError.value = '';

  if (!password.value) {
    passwordError.value = t('common_this_field_is_required');
    return;
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = t('common_this_field_is_required');
    return;
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = t('auth_passwords_do_not_match');
    return;
  }

  const token = route.query.token as string;

  if (!token) {
    appStore.showMessage('auth_invalid_reset_link', 'error');
    return;
  }

  loading.value = true;

  try {
    await authStore.resetPassword(token, password.value, confirmPassword.value);
    success.value = true;
  }
  catch (error) {
    appStore.showMessage(
      error instanceof Error ? error.message : 'auth_password_reset_failed',
      'error',
    );
  }
  finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.reset-password {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 400px;
  width: 100%;
  padding: 32px;
  border: 1px solid color(--v-theme-primary);
  text-align: center;
}

.back-link {
  font-size: 14px;
  color: color(--v-theme-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
