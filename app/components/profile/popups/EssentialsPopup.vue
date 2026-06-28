<template>
  <PopupShell
    v-model="open"
    :title="$t('onboarding_essentials_title')"
    :description="$t('onboarding_essentials_description')"
    persistent
  >
    <FieldCard
      icon="custom:camera-add"
      title="onboarding_photo_title"
      description="onboarding_photo_description"
      required
      :error="avatarError"
    >
      <FileUpload
        v-model="avatarFileId"
        kind="avatar"
        accept="image/*"
        @update:model-value="avatarError = ''"
      >
        <template #activator="{ open: openPicker, previewUrl, uploading, progress }">
          <div class="photo-action">
            <div
              v-if="hasAvatar && !uploading"
              class="photo-thumb"
            >
              <img
                :src="previewUrl || existingAvatarUrl"
                alt=""
              >
            </div>
            <v-progress-circular
              v-if="uploading"
              :model-value="progress"
              :size="36"
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
    </FieldCard>

    <FieldCard
      icon="custom:camera-add"
      title="onboarding_bio_title"
      description="onboarding_bio_description"
      required
    >
      <TextArea
        v-model="bio"
        color="accent"
        :placeholder="$t('register_bio_placeholder')"
        :error-messages="bioError"
        :counter="MAX_BIO_LENGTH"
        :maxlength="MAX_BIO_LENGTH"
        :rows="3"
        auto-grow
        hide-details="auto"
        @update:model-value="bioError = ''"
      />
    </FieldCard>

    <FieldCard
      icon="custom:camera-add"
      title="onboarding_experience_level_title"
      description="onboarding_experience_level_description"
      required
    >
      <Select
        v-model="experienceLevel"
        color="accent"
        :placeholder="$t('onboarding_select_placeholder')"
        :items="experienceLevelItems"
        :error-messages="experienceLevelError"
        @update:model-value="experienceLevelError = ''"
      />
    </FieldCard>

    <FieldCard
      icon="custom:camera-add"
      title="onboarding_languages_title"
      description="onboarding_languages_description"
      required
    >
      <v-autocomplete
        v-model="languages"
        class="languages-select"
        color="accent"
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
    </FieldCard>

    <template #actions>
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
import { STEP_IDS } from '~/components/auth/registerSteps';
import { EXPERIENCE_LEVELS } from '~/utils/constants';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
  getLanguageSearchHaystack,
} from '~/utils/languages';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import FieldCard from '~/components/profile/popups/FieldCard.vue';
import Select from '~/components/Select.vue';
import Button from '~/components/Button.vue';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  completed: [];
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

const MAX_BIO_LENGTH = 1000;

const avatarFileId = ref('');
const bio = ref(authStore.user?.bio ?? '');
const experienceLevel = ref(authStore.user?.experienceLevel ?? '');
const languages = ref<string[]>([...(authStore.user?.languages ?? [])]);

const avatarError = ref('');
const bioError = ref('');
const experienceLevelError = ref('');
const languagesError = ref('');
const saving = ref(false);

const existingAvatarUrl = computed(() => authStore.user?.avatar ?? '');
// A photo is satisfied by either a freshly-uploaded file or one already on file.
const hasAvatar = computed(() => !!avatarFileId.value || !!existingAvatarUrl.value);

const experienceLevelItems = computed(() =>
  EXPERIENCE_LEVELS.map(id => ({ value: id, title: t(id) })),
);

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

const validate = (): boolean => {
  avatarError.value = '';
  bioError.value = '';
  experienceLevelError.value = '';
  languagesError.value = '';
  let ok = true;

  if (!hasAvatar.value) {
    avatarError.value = t('register_avatar_required');
    ok = false;
  }
  if (!bio.value.trim()) {
    bioError.value = t('common_this_field_is_required');
    ok = false;
  }
  else if (bio.value.trim().length > MAX_BIO_LENGTH) {
    bioError.value = t('register_bio_too_long');
    ok = false;
  }
  if (!experienceLevel.value) {
    experienceLevelError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (languages.value.length === 0) {
    languagesError.value = t('common_this_field_is_required');
    ok = false;
  }

  return ok;
};

const save = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    // A freshly-uploaded avatar is bound via the file-attach flow, not /users/update.
    if (avatarFileId.value) {
      const attached = await userStore.attachAvatar(avatarFileId.value);
      if (!attached) return;
    }

    const data = await userStore.updateUser({
      bio: bio.value.trim(),
      experienceLevel: experienceLevel.value,
      languages: languages.value,
      completeStep: STEP_IDS.ESSENTIALS,
    });
    if (!data) return;

    open.value = false;
    emit('completed');
  }
  finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.photo-action {
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-thumb {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.languages-select :deep(.v-field) {
  border-radius: 16px;
}
</style>
