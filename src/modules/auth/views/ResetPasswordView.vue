<template>
  <AuthLayout>
    <div class="reset-password">
      <Header />
      <div class="content">
        <div class="form-card">
          <template v-if="success">
            <v-icon color="success" size="48">mdi-check-circle-outline</v-icon>
            <h2>{{ $t('auth_password_reset_success') }}</h2>
            <p>{{ $t('auth_password_reset_success_description') }}</p>
            <v-btn color="primary" @click="navigateTo('Login')">{{ $t('common_login') }}</v-btn>
          </template>

          <template v-else>
            <h2>{{ $t('auth_reset_password') }}</h2>

            <Input
              type="password"
              label="auth_new_password"
              v-model="password"
              required
              :error-messages="passwordError"
              hide-details="auto"
            />

            <Input
              type="password"
              label="common_confirm_password"
              v-model="confirmPassword"
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

          <router-link to="/login" class="back-link">{{ $t('auth_back_to_login') }}</router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { useRouteHelpers } from '@/composables/useRouteHelpers';
import AuthLayout from '@/layouts/auth.vue';
import Header from '@/components/Header.vue';
import Input from '@/components/Input.vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();
const { navigateTo } = useRouteHelpers();
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
  } catch (error) {
    appStore.showMessage(
      error instanceof Error ? error.message : 'auth_password_reset_failed',
      'error',
    );
  } finally {
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
