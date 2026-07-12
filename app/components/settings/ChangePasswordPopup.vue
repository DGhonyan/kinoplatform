<template>
  <PopupShell
    v-model="open"
    :title="$t('settings_change_password')"
    :description="$t('settings_change_password_hint')"
    :max-width="460"
    @submit="submit"
  >
    <Input
      v-model="form.current"
      color="primary"
      type="password"
      label="settings_current_password"
      required
      hide-details="auto"
      :error-messages="errors.current"
      @update:model-value="errors.current = ''"
    />
    <Input
      v-model="form.next"
      color="primary"
      type="password"
      label="settings_new_password"
      required
      hide-details="auto"
      :hint="$t('register_password_requirements')"
      persistent-hint
      :error-messages="errors.next"
      @update:model-value="errors.next = ''"
    />
    <Input
      v-model="form.confirm"
      color="primary"
      type="password"
      label="settings_confirm_new_password"
      required
      hide-details="auto"
      :error-messages="errors.confirm"
      @update:model-value="errors.confirm = ''"
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
        variant="secondary"
        color="white"
        size="large"
        :loading="busy"
        @click="submit"
      >
        {{ $t('common_save') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Input from '~/components/Input.vue';
import Button from '~/components/Button.vue';
import { PASSWORD_RE } from '~/utils/password';
import { ERROR_CODE } from '~/utils/errorCodes';

const open = defineModel<boolean>({ required: true });

const { t } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const { form, errors, busy, applyError } = usePopupForm(
  open,
  () => ({ current: '', next: '', confirm: '' }),
  () => ({ current: '', next: '', confirm: '' }),
);

const validate = (): boolean => {
  errors.current = errors.next = errors.confirm = '';
  let ok = true;

  if (!form.current) {
    errors.current = t('common_this_field_is_required');
    ok = false;
  }
  if (!form.next) {
    errors.next = t('common_this_field_is_required');
    ok = false;
  }
  else if (!PASSWORD_RE.test(form.next)) {
    errors.next = t('register_password_requirements');
    ok = false;
  }
  else if (form.next === form.current) {
    errors.next = t('settings_password_must_differ');
    ok = false;
  }
  if (form.confirm !== form.next) {
    errors.confirm = t('settings_passwords_do_not_match');
    ok = false;
  }

  return ok;
};

const submit = async () => {
  if (busy.value || !validate()) return;

  busy.value = true;
  try {
    const { error } = await authStore.changePassword(form.current, form.next);

    if (error) {
      // Wrong current password lands on its field; anything else is a snackbar.
      applyError(error, { [ERROR_CODE.INVALID_CURRENT_PASSWORD]: 'current' });
      return;
    }

    appStore.showMessage('settings_password_changed', 'success');
    open.value = false;
  }
  finally {
    busy.value = false;
  }
};
</script>
