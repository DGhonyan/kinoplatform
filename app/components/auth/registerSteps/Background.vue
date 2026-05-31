<template>
  <div class="register-step">
    <p class="description">
      {{ $t('register_background_description') }}
    </p>

    <Input
      v-model="formData.location"
      type="text"
      :placeholder="$t('register_location_placeholder')"
      required
      prepend-inner-icon="custom:map-pin"
      :error-messages="locationError"
      hide-details="auto"
      @update:model-value="locationError = ''"
    />

    <Input
      v-model="formData.education"
      type="text"
      :placeholder="$t('register_education_placeholder')"
      required
      prepend-inner-icon="custom:graduation-cap"
      :error-messages="educationError"
      hide-details="auto"
      @update:model-value="educationError = ''"
    />

    <v-autocomplete
      v-model="formData.languages"
      class="languages-select"
      variant="outlined"
      color="primary"
      base-color="grey"
      :placeholder="$t('register_languages_placeholder')"
      :items="languageItems"
      :custom-filter="filterLanguage"
      :error-messages="languagesError"
      :no-data-text="$t('register_no_languages_match')"
      hide-details="auto"
      multiple
      chips
      closable-chips
      autocomplete="suppress"
      @update:model-value="languagesError = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { RegisterFormDataKey } from '../registerSteps';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
  getLanguageSearchHaystack,
} from '~/utils/languages';

const formData = inject(RegisterFormDataKey)!;
const { t, locale } = useI18n();

const locationError = ref('');
const educationError = ref('');
const languagesError = ref('');

const languageItems = computed(() =>
  LANGUAGE_CODES
    .map(code => ({ value: code, title: getLanguageDisplayName(code, locale.value) }))
    // Drop codes the browser has no localized or English name for — surfacing
    // a raw "aa" / "ae" in the dropdown is worse than omitting the language.
    .filter((item): item is { value: string; title: string } => item.title !== null)
    .sort((a, b) => a.title.localeCompare(b.title, locale.value)),
);

// Vuetify calls this once per item; return true to keep it in the dropdown.
// Match against code + English name + native name + localized name so users
// can search in whichever language is most natural to them.
const filterLanguage = (
  _itemTitle: string,
  query: string,
  item?: { raw: { value: string } },
): boolean => {
  const code = item?.raw.value;
  if (!code) return false;
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return getLanguageSearchHaystack(code, locale.value).includes(q);
};

const validate = (): boolean => {
  locationError.value = '';
  educationError.value = '';
  languagesError.value = '';
  let ok = true;

  if (!formData.location.trim()) {
    locationError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!formData.education.trim()) {
    educationError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (formData.languages.length === 0) {
    languagesError.value = t('common_this_field_is_required');
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

.description {
  text-align: center;
  font-size: 14px;
}

.languages-select :deep(.v-field) {
  border-radius: 16px;
}

:deep(.v-input__details) {
  padding: 0 !important;
}
</style>
