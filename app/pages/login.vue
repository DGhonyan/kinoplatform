<template>
  <div class="login-page">
    <Card>
      <h2 class="title">
        {{ $t('common_login') }}
      </h2>

      <div
        v-if="unverifiedEmail"
        class="verification-banner"
      >
        <div class="verification-header">
          <v-icon
            color="info"
            class="mr-2"
          >
            mdi-email-check-outline
          </v-icon>
          <span>{{ $t('auth_check_email_verification') }}</span>
        </div>

        <Input
          v-model="code"
          type="text"
          :placeholder="$t('register_code_placeholder')"
          required
          maxlength="6"
          inputmode="numeric"
          :error-messages="codeError"
          hide-details="auto"
          @update:model-value="codeError = ''"
        />

        <div class="verification-actions">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            :loading="resending"
            @click="handleResendVerification"
          >
            {{ $t('auth_resend_verification') }}
          </v-btn>
          <v-btn
            color="primary"
            rounded="pill"
            :loading="verifying"
            @click="handleVerify"
          >
            {{ $t('common_next') }}
          </v-btn>
        </div>
      </div>

      <AuthLogin @unverified="onUnverified" />

      <div class="footer">
        <span>{{ $t('login_dont_have_account') }}</span>
        <NuxtLink
          to="/register"
          class="link"
        >
          {{ $t('common_register') }}
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'hero' });

const { t } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const unverifiedEmail = ref('');
const code = ref('');
const codeError = ref('');
const resending = ref(false);
const verifying = ref(false);

const onUnverified = (email: string) => {
  unverifiedEmail.value = email;
  code.value = '';
  codeError.value = '';
};

const handleResendVerification = async () => {
  if (!unverifiedEmail.value) return;

  resending.value = true;
  const ok = await authStore.resendVerification(unverifiedEmail.value);
  resending.value = false;
  appStore.showMessage(
    ok ? 'auth_verification_resent' : 'auth_verification_resend_failed',
    ok ? 'success' : 'error',
  );
};

const handleVerify = async () => {
  codeError.value = '';

  if (!/^\d{6}$/.test(code.value.trim())) {
    codeError.value = t('register_invalid_code');
    return;
  }

  verifying.value = true;
  const res = await authStore.verifyEmail(unverifiedEmail.value, code.value.trim());
  verifying.value = false;

  if (res.error) {
    codeError.value = t(apiErrorMessageKey(res.error));
    return;
  }

  unverifiedEmail.value = '';
  code.value = '';
  appStore.showMessage('auth_email_verified', 'success');
};
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $base-padding;
}

.title {
  text-align: center;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.link {
  color: color(--v-theme-primary);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.verification-banner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: rgba(var(--v-theme-info), 0.08);
  border: 1px solid rgba(var(--v-theme-info), 0.3);
  border-radius: 8px;
  font-size: 14px;
}

.verification-header {
  display: flex;
  align-items: center;
}

.verification-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
</style>
