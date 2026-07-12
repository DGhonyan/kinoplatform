<template>
  <PopupShell
    v-model="open"
    :title="$t('settings_change_email')"
    :description="step === 'request'
      ? $t('settings_change_email_hint')
      : $t('settings_change_email_code_hint', { email: pendingEmail })"
    :max-width="460"
    :show-back="step === 'confirm'"
    @back="step = 'request'"
    @submit="onSubmit"
  >
    <!-- Step 1: new address + current password -->
    <template v-if="step === 'request'">
      <Input
        v-model="form.email"
        color="primary"
        type="email"
        label="settings_new_email"
        required
        hide-details="auto"
        :error-messages="errors.email"
        @update:model-value="errors.email = ''"
      />
      <Input
        v-model="form.password"
        color="primary"
        type="password"
        label="settings_current_password"
        required
        hide-details="auto"
        :error-messages="errors.password"
        @update:model-value="errors.password = ''"
      />
    </template>

    <!-- Step 2: verification code sent to the new address -->
    <Input
      v-else
      v-model="form.code"
      color="primary"
      type="text"
      label="settings_verification_code"
      inputmode="numeric"
      required
      hide-details="auto"
      :error-messages="errors.code"
      @update:model-value="errors.code = ''"
    />

    <template #actions>
      <Button
        variant="secondary"
        color="white"
        size="large"
        :disabled="busy"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        v-if="step === 'request'"
        variant="secondary"
        color="white"
        size="large"
        :loading="busy"
        @click="requestChange"
      >
        {{ $t('settings_send_code') }}
      </Button>
      <Button
        v-else
        variant="secondary"
        color="white"
        size="large"
        :loading="busy"
        @click="confirmChange"
      >
        {{ $t('common_confirm') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Input from '~/components/Input.vue';
import Button from '~/components/Button.vue';
import { ERROR_CODE } from '~/utils/errorCodes';
import { isValidEmail } from '~/utils/email';

const open = defineModel<boolean>({ required: true });

const { t } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const step = ref<'request' | 'confirm'>('request');
const pendingEmail = ref('');

const { form, errors, busy, applyError } = usePopupForm(
  open,
  () => ({ email: '', password: '', code: '' }),
  () => ({ email: '', password: '', code: '' }),
  () => {
    step.value = 'request';
    pendingEmail.value = '';
  },
);

// Enter submits the step currently on screen.
const onSubmit = () => (step.value === 'request' ? requestChange() : confirmChange());

const requestChange = async () => {
  if (busy.value) return;
  errors.email = errors.password = '';

  if (!form.email.trim()) errors.email = t('common_this_field_is_required');
  else if (!isValidEmail(form.email)) errors.email = t('auth_invalid_email');
  if (!form.password) errors.password = t('common_this_field_is_required');
  if (errors.email || errors.password) return;

  busy.value = true;
  try {
    const { error } = await authStore.requestEmailChange(
      form.email.trim(),
      form.password,
    );

    if (error) {
      applyError(error, {
        [ERROR_CODE.INVALID_CURRENT_PASSWORD]: 'password',
        [ERROR_CODE.EMAIL_IN_USE]: 'email',
      });
      return;
    }

    pendingEmail.value = form.email.trim();
    step.value = 'confirm';
  }
  finally {
    busy.value = false;
  }
};

const confirmChange = async () => {
  if (busy.value) return;
  errors.code = '';

  if (!form.code.trim()) {
    errors.code = t('common_this_field_is_required');
    return;
  }

  busy.value = true;
  try {
    const { error } = await authStore.confirmEmailChange(form.code.trim(), pendingEmail.value);

    if (error) {
      // Any confirm error is inline on the code field.
      applyError(error, {}, 'code');
      return;
    }

    appStore.showMessage('settings_email_changed', 'success');
    open.value = false;
  }
  finally {
    busy.value = false;
  }
};
</script>
