<template>
  <AuthLayout>
    <div class="forgot-password">
      <Header />
      <div class="content">
        <div class="form-card">
          <h2>{{ $t('auth_forgot_password') }}</h2>
          <p>{{ $t('auth_forgot_password_description') }}</p>

          <div v-if="submitted" class="submitted-message">
            <v-icon color="success" class="mr-2">mdi-email-check-outline</v-icon>
            <span>{{ $t('auth_reset_email_sent') }}</span>
          </div>

          <template v-else>
            <Input
              type="email"
              label="common_email"
              v-model="email"
              required
              :error-messages="emailError"
              hide-details="auto"
            />

            <v-btn
              color="primary"
              :loading="loading"
              @click="handleSubmit"
            >
              {{ $t('auth_send_reset_link') }}
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
import { useAuthStore } from '@/stores/auth';
import AuthLayout from '@/layouts/auth.vue';
import Header from '@/components/Header.vue';
import Input from '@/components/Input.vue';
import { useAppStore } from '@/stores/app';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const email = ref('');
const emailError = ref('');
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  emailError.value = '';

  if (!email.value) {
    emailError.value = t('common_this_field_is_required');
    return;
  }

  loading.value = true;

  try {
    await authStore.requestPasswordReset(email.value);
    submitted.value = true;
  } catch (error) {
    appStore.showMessage('auth_password_reset_request_failed', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.forgot-password {
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
  gap: 16px;
  max-width: 400px;
  width: 100%;
  padding: 32px;
  border: 1px solid color(--v-theme-primary);
}

.submitted-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.3);
  border-radius: 8px;
  font-size: 14px;
}

.back-link {
  font-size: 14px;
  color: color(--v-theme-primary);
  text-decoration: none;
  text-align: center;

  &:hover {
    text-decoration: underline;
  }
}
</style>
