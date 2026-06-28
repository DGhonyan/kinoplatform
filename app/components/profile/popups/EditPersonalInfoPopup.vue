<template>
  <PopupShell
    v-model="open"
    :title="$t('profile_edit_personal_info')"
  >
    <div class="edit-form">
      <!-- Avatar -->
      <FileUpload
        v-model="avatarFileId"
        kind="avatar"
        accept="image/*"
        @update:model-value="avatarError = ''"
      >
        <template #activator="{ open: openPicker, previewUrl, uploading, progress }">
          <div class="avatar-row">
            <div
              v-if="hasAvatar && !uploading"
              class="avatar-thumb"
            >
              <img
                :src="previewUrl || existingAvatarUrl"
                alt=""
              >
            </div>
            <v-progress-circular
              v-if="uploading"
              :model-value="progress"
              :size="44"
              :width="4"
              color="accent"
            />
            <Button
              variant="secondary"
              color="accent"
              size="small"
              :disabled="uploading"
              @click="openPicker"
            >
              {{ hasAvatar ? $t('onboarding_change_photo') : $t('onboarding_upload_photo') }}
            </Button>
          </div>
        </template>
      </FileUpload>

      <div class="row">
        <Input
          v-model="form.firstName"
          color="accent"
          type="text"
          label="common_first_name"
          required
          :error-messages="errors.firstName"
          hide-details="auto"
          @update:model-value="errors.firstName = ''"
        />
        <Input
          v-model="form.lastName"
          color="accent"
          type="text"
          label="common_last_name"
          required
          :error-messages="errors.lastName"
          hide-details="auto"
          @update:model-value="errors.lastName = ''"
        />
      </div>

      <div class="row">
        <Select
          v-model="form.gender"
          color="accent"
          label="register_gender_label"
          :placeholder="$t('onboarding_select_placeholder')"
          :items="genderItems"
          required
          :error-messages="errors.gender"
          @update:model-value="errors.gender = ''"
        />
        <DateInput
          v-model="form.birthDate"
          :placeholder="$t('register_birth_date_placeholder')"
          :max="todayIsoDate"
          required
          :error-messages="errors.birthDate"
          hide-details="auto"
          prepend-icon="custom:birthday"
          @update:model-value="errors.birthDate = ''"
        />
      </div>

      <Input
        v-model="form.location"
        color="accent"
        type="text"
        label="register_location_placeholder"
        required
        :error-messages="errors.location"
        hide-details="auto"
        @update:model-value="errors.location = ''"
      />

      <Input
        v-model="form.education"
        color="accent"
        type="text"
        label="onboarding_education_title"
        hide-details="auto"
      />

      <ChipPickerField
        v-model="form.profession"
        :groups="PROFESSION_GROUPS"
        label="common_professions"
        :title="$t('register_professions_title')"
        :placeholder="$t('register_professions_placeholder')"
        :search-placeholder="$t('register_professions_placeholder')"
        :error="errors.profession"
      />

      <Select
        v-model="form.experienceLevel"
        color="accent"
        label="onboarding_experience_level_title"
        :placeholder="$t('onboarding_select_placeholder')"
        :items="experienceLevelItems"
        required
        :error-messages="errors.experienceLevel"
        @update:model-value="errors.experienceLevel = ''"
      />

      <div class="field">
        <span class="field-label">{{ $t('onboarding_languages_title') }} <span class="asterisk">*</span></span>
        <v-autocomplete
          v-model="form.languages"
          class="languages-select"
          color="accent"
          base-color="grey"
          :placeholder="$t('register_languages_placeholder')"
          :items="languageItems"
          :custom-filter="filterLanguage"
          :error-messages="errors.languages"
          :no-data-text="$t('register_no_languages_match')"
          hide-details="auto"
          multiple
          chips
          closable-chips
          autocomplete="suppress"
          @update:model-value="errors.languages = ''"
        />
      </div>

      <Input
        v-model="form.portfolio"
        color="accent"
        type="url"
        label="common_portfolio_link"
        prepend-inner-icon="mdi-link-variant"
        :error-messages="errors.portfolio"
        hide-details="auto"
        @update:model-value="errors.portfolio = ''"
      />

      <TextArea
        v-model="form.bio"
        color="accent"
        label="common_bio"
        :counter="MAX_BIO_LENGTH"
        :maxlength="MAX_BIO_LENGTH"
        :rows="3"
        required
        auto-grow
        hide-details="auto"
        :error-messages="errors.bio"
        @update:model-value="errors.bio = ''"
      />
    </div>

    <template #actions>
      <Button
        variant="secondary"
        color="accent"
        size="large"
        :disabled="saving"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        color="accent"
        size="large"
        :loading="saving"
        @click="save"
      >
        {{ $t('common_save') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { Gender } from '~~/shared/types/user';
import { GENDERS, EXPERIENCE_LEVELS, PROFESSION_GROUPS } from '~/utils/constants';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
  getLanguageSearchHaystack,
} from '~/utils/languages';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ChipPickerField from '~/components/profile/popups/ChipPickerField.vue';
import Select from '~/components/Select.vue';
import Button from '~/components/Button.vue';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{ saved: [] }>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

const MAX_BIO_LENGTH = 1000;
const todayIsoDate = new Date().toISOString().split('T')[0];
// Latest birth date that still makes the user at least 16 (mirrors the backend).
const minAgeCutoff = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d;
})();

const u = authStore.user;
const form = reactive({
  firstName: u?.firstName ?? '',
  lastName: u?.lastName ?? '',
  gender: (u?.gender ?? null) as Gender | null,
  birthDate: u?.birthDate ?? '',
  location: u?.location ?? '',
  education: u?.education ?? '',
  profession: [...(u?.profession ?? [])],
  experienceLevel: u?.experienceLevel ?? '',
  languages: [...(u?.languages ?? [])],
  portfolio: u?.portfolio ?? '',
  bio: u?.bio ?? '',
});

const errors = reactive({
  firstName: '', lastName: '', gender: '', birthDate: '', location: '',
  profession: '', experienceLevel: '', languages: '', portfolio: '', bio: '',
});

const avatarFileId = ref('');
const avatarError = ref('');
const saving = ref(false);

const existingAvatarUrl = computed(() => authStore.user?.avatar ?? '');
const hasAvatar = computed(() => !!avatarFileId.value || !!existingAvatarUrl.value);

const genderItems = computed(() => GENDERS.map(g => ({ value: g, title: t(`gender_${g}`) })));
const experienceLevelItems = computed(() => EXPERIENCE_LEVELS.map(id => ({ value: id, title: t(id) })));

const languageItems = computed(() =>
  LANGUAGE_CODES
    .map(code => ({ value: code, title: getLanguageDisplayName(code, locale.value) }))
    .filter((item): item is { value: string; title: string } => item.title !== null)
    .sort((a, b) => a.title.localeCompare(b.title, locale.value)),
);

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

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

const validate = (): boolean => {
  (Object.keys(errors) as (keyof typeof errors)[]).forEach(k => (errors[k] = ''));
  let ok = true;

  if (!form.firstName.trim()) { errors.firstName = t('common_this_field_is_required'); ok = false; }
  if (!form.lastName.trim()) { errors.lastName = t('common_this_field_is_required'); ok = false; }
  if (!form.gender) { errors.gender = t('common_this_field_is_required'); ok = false; }
  if (!form.birthDate) {
    errors.birthDate = t('common_this_field_is_required');
    ok = false;
  }
  else {
    const date = new Date(form.birthDate);
    if (Number.isNaN(date.getTime())) { errors.birthDate = t('register_invalid_birth_date'); ok = false; }
    else if (date > new Date()) { errors.birthDate = t('register_birth_date_in_future'); ok = false; }
    else if (date > minAgeCutoff) { errors.birthDate = t('register_min_age'); ok = false; }
  }
  if (!form.location.trim()) { errors.location = t('common_this_field_is_required'); ok = false; }
  if (form.profession.length === 0) { errors.profession = t('common_this_field_is_required'); ok = false; }
  if (!form.experienceLevel) { errors.experienceLevel = t('common_this_field_is_required'); ok = false; }
  if (form.languages.length === 0) { errors.languages = t('common_this_field_is_required'); ok = false; }
  if (!form.bio.trim()) { errors.bio = t('common_this_field_is_required'); ok = false; }

  const link = form.portfolio.trim();
  if (link && !URL_RE.test(link.startsWith('http') ? link : `https://${link}`)) {
    errors.portfolio = t('register_portfolio_invalid_url');
    ok = false;
  }

  return ok;
};

const save = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    if (avatarFileId.value) {
      const attached = await userStore.attachAvatar(avatarFileId.value);
      if (!attached) return;
    }

    const link = form.portfolio.trim();
    const normalizedLink = link && !/^https?:\/\//i.test(link) ? `https://${link}` : link;

    const data = await userStore.updateUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender || undefined,
      birthDate: form.birthDate,
      location: form.location.trim(),
      education: form.education.trim(),
      profession: form.profession,
      experienceLevel: form.experienceLevel,
      languages: form.languages,
      portfolio: normalizedLink,
      bio: form.bio.trim(),
    });
    if (!data) return;

    open.value = false;
    emit('saved');
  }
  finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
  }
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-thumb {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
}

.asterisk {
  color: rgb(var(--v-theme-error));
}

.languages-select :deep(.v-field) {
  border-radius: 16px;
}
</style>
