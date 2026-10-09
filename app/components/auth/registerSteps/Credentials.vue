<template>
  <div class="register-step">
    <div class="descriptions">
      <p class="description">
        {{ $t('register_credentials_description') }}
      </p>
    </div>

    <Input
      v-model="formData.email"
      prepend-inner-icon="custom:mail"
      type="email"
      :placeholder="$t('common_email')"
      required
      :error-messages="emailError"
      hide-details="auto"
      @update:model-value="emailError = ''"
    />
    <Input
      v-model="formData.password"
      prepend-inner-icon="custom:lock"
      type="password"
      :placeholder="$t('common_password')"
      required
      :error-messages="passwordError"
      hide-details="auto"
      persistent-hint
      :hint="$t('register_password_requirements')"
      @update:model-value="passwordError = ''"
    />

    <div class="consents">
      <v-checkbox
        v-model="formData.acceptPrivacy"
        density="compact"
        color="primary"
        :error-messages="privacyError"
        hide-details="auto"
        @update:model-value="privacyError = ''"
      >
        <template #label>
          <i18n-t
            keypath="register_privacy_agree"
            tag="span"
          >
            <template #policy>
              <!-- New tab so the half-filled wizard isn't lost; .stop keeps the
                   click from toggling the checkbox. -->
              <NuxtLink
                to="/privacy"
                target="_blank"
                class="link"
                @click.stop
              >
                {{ $t('privacy_policy_inline') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </template>
      </v-checkbox>
      <v-checkbox
        v-model="formData.marketingConsent"
        :label="$t('register_marketing_opt_in')"
        density="compact"
        color="primary"
        hide-details
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';
import { PASSWORD_RE } from '~/utils/password';
import { isValidEmail } from '~/utils/email';

const formData = inject(RegisterFormDataKey)!;

const { t } = useI18n();

const emailError = ref('');
const passwordError = ref('');
const privacyError = ref('');

const validate = (): boolean => {
  emailError.value = '';
  passwordError.value = '';
  privacyError.value = '';
  let ok = true;

  const email = formData.email.trim();
  if (!email) {
    emailError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (!isValidEmail(email)) {
    emailError.value = t('auth_invalid_email');
    ok = false;
  }

  if (!formData.password) {
    passwordError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (!PASSWORD_RE.test(formData.password)) {
    passwordError.value = t('register_password_requirements');
    ok = false;
  }

  // The backend refuses to create an account without an accepted policy version.
  if (!formData.acceptPrivacy) {
    privacyError.value = t('register_privacy_required');
    ok = false;
  }

  return ok;
};

defineExpose({ validate });
</script>

<style scoped lang="scss">
.register-step {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.descriptions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consents {
  display: flex;
  flex-direction: column;
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
