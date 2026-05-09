<template>
  <div class="login-form">
    <template
      v-for="field in Object.values(fields)"
      :key="field.label"
    >
      <Input
        v-model="field.model.value"
        :type="field.type"
        :label="field.label"
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
      <NuxtLink
        to="/forgot-password"
        class="forgot-password-link"
      >
        {{ $t('auth_forgot_password') }}
      </NuxtLink>
    </div>

    <v-btn
      color="primary"
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
    navigateTo('/');
  }
  catch (error) {
    if (error instanceof Error && error.message.includes('verify your email')) {
      emit('unverified', fields.email.model.value);
    }
    return;
  }
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
