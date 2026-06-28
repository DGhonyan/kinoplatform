<template>
  <div class="forgot-password-page">
    <Card :gap="16">
      <h2 class="title">
        {{ $t('auth_forgot_password') }}
      </h2>

      <p class="description">
        {{ $t('auth_forgot_password_description') }}
      </p>

      <Input
        v-model="email"
        type="email"
        :placeholder="$t('common_email')"
        required
        :error-messages="emailError"
        hide-details="auto"
        @update:model-value="emailError = ''"
        bg-color="accent"
      />

      <v-btn
        color="primary"
        rounded="pill"
        size="large"
        block
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t('auth_send_reset_code') }}
      </v-btn>

      <div class="footer">
        <NuxtLink
          to="/login"
          class="link"
        >
          {{ $t('auth_back_to_login') }}
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'hero' });

const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const email = ref('');
const emailError = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  emailError.value = '';

  const value = email.value.trim();
  if (!value) {
    emailError.value = t('common_this_field_is_required');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    emailError.value = t('auth_invalid_email');
    return;
  }

  loading.value = true;
  const ok = await authStore.requestPasswordReset(value);
  loading.value = false;

  if (!ok) {
    appStore.showMessage('auth_password_reset_request_failed', 'error');
    return;
  }

  appStore.showMessage('auth_reset_code_sent', 'success');
  navigateTo({ path: '/reset-password', query: { email: value } });
};
</script>

<style scoped lang="scss">
.forgot-password-page {
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

.description {
  text-align: center;
  font-size: 14px;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
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
</style>
