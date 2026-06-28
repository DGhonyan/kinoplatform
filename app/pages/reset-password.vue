<template>
  <div class="reset-password-page">
    <Card :gap="16">
      <h2 class="title">
        {{ $t('auth_reset_password') }}
      </h2>

      <p class="description">
        {{ $t('auth_reset_password_description') }}
      </p>
      <p class="description small">
        {{ $t('register_password_requirements') }}
      </p>

      <form
        class="reset-form"
        @submit.prevent="handleReset"
      >
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
        <Input
          v-model="password"
          type="password"
          :placeholder="$t('auth_new_password')"
          required
          :error-messages="passwordError"
          hide-details="auto"
          @update:model-value="passwordError = ''"
        />

        <Button
          type="submit"
          color="primary"
          rounded="pill"
          size="large"
          block
          :loading="loading"
        >
          {{ $t('auth_reset_password') }}
        </Button>
      </form>

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

const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const email = ref((route.query.email as string | undefined) ?? '');
const code = ref('');
const password = ref('');

const emailError = ref('');
const codeError = ref('');
const passwordError = ref('');
const loading = ref(false);

// Mirrors the backend's PASSWORD_REGEX in auth.dto.ts.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/;

const validate = (): boolean => {
  emailError.value = '';
  codeError.value = '';
  passwordError.value = '';
  let ok = true;

  const emailValue = email.value.trim();
  if (!emailValue) {
    emailError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    emailError.value = t('auth_invalid_email');
    ok = false;
  }

  const codeValue = code.value.trim();
  if (!codeValue) {
    codeError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (!/^\d{6}$/.test(codeValue)) {
    codeError.value = t('register_invalid_code');
    ok = false;
  }

  if (!password.value) {
    passwordError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (!PASSWORD_RE.test(password.value)) {
    passwordError.value = t('register_password_requirements');
    ok = false;
  }

  return ok;
};

const handleReset = async () => {
  if (loading.value) return;
  if (!validate()) return;

  loading.value = true;
  const ok = await authStore.resetPassword(email.value.trim(), code.value.trim(), password.value);
  loading.value = false;

  if (!ok) return;

  appStore.showMessage('auth_password_reset_success', 'success');
  navigateTo('/login');
};
</script>

<style scoped lang="scss">
.reset-password-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $base-padding;
}

// Keep the 16px rhythm the Card gap gave the fields before they were wrapped.
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  text-align: center;
}

.description {
  text-align: center;
  font-size: 14px;
}

.description.small {
  font-size: 12px;
  color: color(--v-theme-gray);
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
