<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_portfolio_description') }}
    </p>

    <Input
      v-model="formData.portfolio"
      type="url"
      :placeholder="$t('register_portfolio_link_placeholder')"
      prepend-inner-icon="mdi-link-variant"
      :error-messages="linkError"
      hide-details="auto"
      @update:model-value="clearErrors"
    />

    <div class="separator">
      <span class="line" />
      <span class="or-text">{{ $t('common_or') }}</span>
      <span class="line" />
    </div>

    <FileUpload
      v-model="formData.portfolioFile"
      accept="application/pdf,.pdf"
      placeholder="register_portfolio_file_placeholder"
      helper-text="register_portfolio_file_helper"
      @update:model-value="clearErrors"
    />

    <p
      v-if="formError"
      class="form-error"
    >
      {{ formError }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';

const formData = inject(RegisterFormDataKey)!;

const linkError = ref('');
const formError = ref('');

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

const clearErrors = () => {
  linkError.value = '';
  formError.value = '';
};

const validate = (): boolean => {
  linkError.value = '';
  formError.value = '';

  const raw = formData.portfolio.trim();
  let normalizedLink = raw;
  // Be forgiving: user types "myportfolio.com" → store as "https://myportfolio.com".
  if (raw && !/^https?:\/\//i.test(raw)) {
    normalizedLink = `https://${raw}`;
  }
  formData.portfolio = normalizedLink;

  const hasLink = normalizedLink.length > 0;
  const hasFile = formData.portfolioFile.length > 0;

  if (hasLink && !URL_RE.test(normalizedLink)) {
    linkError.value = 'register_portfolio_invalid_url';
    return false;
  }

  if (!hasLink && !hasFile) {
    formError.value = 'register_portfolio_required';
    return false;
  }

  return true;
};

defineExpose({ validate });
</script>

<style scoped lang="scss">
.register-step {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description {
  text-align: center;
  font-size: 14px;
}

.separator {
  display: flex;
  align-items: center;
  gap: 12px;
  color: color(--v-theme-gray);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.line {
  flex: 1;
  height: 1px;
  background-color: rgba(var(--v-theme-gray), 0.3);
}

.form-error {
  color: rgb(var(--v-theme-error));
  font-size: 12px;
  text-align: center;
}
</style>
