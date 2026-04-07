<template>
  <div class="login-form">
    <template v-for="field in Object.values(fields)" :key="field.label">
      <Input
        :type="field.type"
        :label="field.label"
        v-model="field.model.value"
        required
        :error-messages="field.errorMessages.value"
        hide-details="auto"
      />
    </template>

    <div class="login-options">
      <v-checkbox
        v-model="rememberMe"
        :label="$t('common_remember_me')"
        density="compact"
        hide-details
      />
      <router-link to="/forgot-password" class="forgot-password-link">
        {{ $t('auth_forgot_password') }}
      </router-link>
    </div>

    <v-btn color="primary" @click="handleLogin">{{ $t('common_login') }}</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Input from '@/components/Input.vue'
import { validateFields } from '@/common/utils'
import { useAuthStore } from '@/stores/auth'
import { useRouteHelpers } from '@/composables/useRouteHelpers'
import { useI18n } from 'vue-i18n';

const { navigateTo } = useRouteHelpers();
const { t } = useI18n();

const rememberMe = ref(false);

const fields = {
  email: {
    model: ref(''),
    label: 'common_email',
    type: 'email',
    errorMessages: ref(''),
  },
  password: {
    model: ref(''),
    label: 'common_password',
    type: 'password',
    errorMessages: ref(''),
  },
};

const handleLogin = async () => {
  if (validateFields(fields, t)) return;

  const authStore = useAuthStore();

  try {
    await authStore.login(fields.email.model.value, fields.password.model.value, rememberMe.value);
    navigateTo('Home');
  } catch (error) {
    console.error('Failed to login');
    return;
  }
}
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
