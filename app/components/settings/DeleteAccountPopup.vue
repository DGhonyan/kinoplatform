<template>
  <PopupShell
    v-model="open"
    :title="$t('settings_delete_account')"
    :max-width="460"
    @submit="submit"
  >
    <p class="warning">
      {{ $t('settings_delete_warning') }}
    </p>
    <Input
      v-model="form.confirmEmail"
      color="primary"
      type="email"
      :label="''"
      required
      hide-details="auto"
      :placeholder="userEmail"
      :hint="$t('settings_delete_type_email', { email: userEmail })"
      persistent-hint
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
        color="error"
        size="large"
        :loading="busy"
        :disabled="!canDelete"
        @click="submit"
      >
        {{ $t('settings_delete_account_confirm') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Input from '~/components/Input.vue';
import Button from '~/components/Button.vue';

const open = defineModel<boolean>({ required: true });

const authStore = useAuthStore();
const accountStore = useAccountStore();
const appStore = useAppStore();

const userEmail = computed(() => authStore.user?.email ?? '');

const { form, errors, busy, applyError } = usePopupForm(
  open,
  () => ({ confirmEmail: '', password: '' }),
  () => ({ password: '' }),
);

// Both guards must pass: the typed email matches the account, and a password is
// present. The backend still re-verifies the password — this is UI friction.
const canDelete = computed(() =>
  form.confirmEmail.trim().toLowerCase() === userEmail.value.toLowerCase()
  && !!form.password,
);

const submit = async () => {
  if (busy.value || !canDelete.value) return;

  busy.value = true;
  try {
    const { error } = await accountStore.deleteAccount(form.password);

    if (error) {
      applyError(error, {}, 'password');
      return;
    }

    // Account (and its auth cookies) are gone. Drop local state and leave.
    authStore.clearAuth();
    appStore.showMessage('settings_account_deleted', 'success');
    open.value = false;
    await navigateTo('/');
  }
  finally {
    busy.value = false;
  }
};
</script>

<style scoped lang="scss">
.warning {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: color(--v-theme-error);
}
</style>
