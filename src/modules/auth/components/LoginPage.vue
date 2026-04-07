<template>
  <div class="login-page">
    <Header />

    <div class="form-wrapper">
      <div class="form">
        <div class="view-control">
          <v-btn :class="['view-control-button', formView === 'login' && 'active']" variant="text" @click="formView = 'login'">{{ $t('common_login') }}</v-btn>
          <v-btn :class="['view-control-button', formView === 'register' && 'active']" variant="text" @click="formView = 'register'">{{ $t('common_register') }}</v-btn>
        </div>

        <div class="input-container">
          <!-- Post-registration verification banner -->
          <div v-if="registeredEmail" class="verification-banner">
            <v-icon color="info" class="mr-2">mdi-email-check-outline</v-icon>
            <div class="verification-text">
              <span>{{ $t('auth_check_email_verification') }}</span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                :loading="resending"
                @click="handleResendVerification"
              >
                {{ $t('auth_resend_verification') }}
              </v-btn>
            </div>
          </div>

          <Login :class="['form-view', formView === 'login' && 'active']"/>
          <Register :class="['form-view', formView === 'register' && 'active']" @registered="onRegistered" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Login from './Login.vue'
import Register from './Register.vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore();
const appStore = useAppStore();

const formView = ref('login')
const registeredEmail = ref('');
const resending = ref(false);

const onRegistered = (email: string) => {
  registeredEmail.value = email;
  formView.value = 'login';
};

const handleResendVerification = async () => {
  if (!registeredEmail.value) return;

  resending.value = true;
  try {
    await authStore.resendVerification(registeredEmail.value);
    appStore.showMessage('auth_verification_resent', 'success');
  } catch {
    appStore.showMessage('auth_verification_resend_failed', 'error');
  } finally {
    resending.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: color(--v-theme-primary);
}

.form-wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form {
  border: 1px solid color(--v-theme-primary);

  display: flex;
  flex-direction: column;
}

.input-container {
  width: 100%;
  min-width: 400px;
  max-width: 600px;

  padding: 32px;

  align-self: center;
  justify-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.view-control {
  width: 100%;

  display: flex;
  justify-content: center;

  border-bottom: 1px solid color(--v-theme-primary);
}

.view-control-button {
  width: 50%;

  padding: 24px;
  border-radius: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: all 0.3s ease;
}

.view-control-button.active {
  color: color(--v-theme-white);
  background-color: color(--v-theme-primary);
}

.view-control-button.login {
  border-right: 0.5px solid color(--v-theme-primary);
}

.view-control-button.register {
  border-left: 0.5px solid color(--v-theme-primary);
}

.form-view.active {
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-view {
  display: none;
}

.verification-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: rgba(var(--v-theme-info), 0.08);
  border: 1px solid rgba(var(--v-theme-info), 0.3);
  border-radius: 8px;
}

.verification-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}
</style>
