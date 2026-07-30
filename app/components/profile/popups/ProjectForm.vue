<template>
  <div class="entity-form">
    <Input
      v-model="draft.name"
      color="accent"
      type="text"
      :label="'onboarding_project_name'"
      :placeholder="$t('onboarding_project_name')"
      required
      :error-messages="errors.name"
      hide-details="auto"
      @update:model-value="errors.name = ''"
    />
    <Input
      v-model="draft.nameOriginal"
      color="accent"
      type="text"
      :label="'onboarding_project_name_original'"
      :placeholder="$t('onboarding_project_name_original_placeholder')"
      hide-details="auto"
    />
    <Select
      v-model="draft.type"
      color="accent"
      :label="'onboarding_project_type'"
      :placeholder="$t('onboarding_select_placeholder')"
      :items="productionTypeItems"
      multiple
      required
      :error-messages="errors.type"
      @update:model-value="errors.type = ''"
    />
    <Select
      v-model="draft.position"
      color="accent"
      :label="'onboarding_project_position'"
      :placeholder="$t('register_professions_placeholder')"
      :items="professionItems"
      multiple
      required
      :error-messages="errors.position"
      @update:model-value="errors.position = ''"
    />

    <v-checkbox
      v-model="draft.workInProgress"
      color="accent"
      density="compact"
      hide-details
      :label="$t('onboarding_work_in_progress')"
    />

    <div
      v-if="!draft.workInProgress"
      class="date-row"
    >
      <Select
        v-model="draft.month"
        color="accent"
        :label="'onboarding_release_month'"
        :placeholder="$t('onboarding_month')"
        :items="months"
        required
        :error-messages="errors.date"
        @update:model-value="errors.date = ''"
      />
      <Select
        v-model="draft.year"
        color="accent"
        :label="'onboarding_release_year'"
        :placeholder="$t('onboarding_year')"
        :items="years"
        required
        :error-messages="errors.date"
        @update:model-value="errors.date = ''"
      />
    </div>

    <!-- Optional poster/still, uploaded immediately and stored as a public URL. -->
    <div class="media-field">
      <span class="media-label">{{ $t('onboarding_project_media') }}</span>
      <FileUpload
        v-model="mediaFileId"
        kind="project_media"
        :aspect-ratio="PROJECT_MEDIA_ASPECT_RATIO"
        accept="image/jpeg,image/png,image/webp"
        @upload:complete="onMediaUploaded"
      >
        <template #activator="{ open: openPicker, previewUrl, uploading, progress }">
          <div class="media-row">
            <div
              v-if="(previewUrl || draft.media) && !uploading"
              class="media-thumb"
            >
              <img
                :src="previewUrl || draft.media"
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
            <div class="media-actions">
              <Button
                variant="secondary"
                color="accent"
                size="small"
                :disabled="uploading"
                @click="openPicker"
              >
                {{ draft.media ? $t('onboarding_change_media') : $t('onboarding_add_media') }}
              </Button>
              <Button
                v-if="draft.media && !uploading"
                variant="text"
                color="error"
                size="small"
                icon="mdi-delete"
                :aria-label="$t('common_delete')"
                @click="removeMedia"
              />
            </div>
          </div>
        </template>
      </FileUpload>
    </div>

    <Input
      v-model="draft.link"
      color="accent"
      type="url"
      :label="'onboarding_project_link_optional'"
      :placeholder="$t('register_portfolio_link_placeholder')"
      :error-messages="errors.link"
      hide-details="auto"
      @update:model-value="errors.link = ''"
    />
    <TextArea
      v-model="draft.description"
      color="accent"
      :label="'onboarding_description_optional'"
      :rows="3"
      auto-grow
      hide-details="auto"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '~~/shared/types/user';
import type { UploadedFile } from '~~/shared/types/file';
import { ALL_PROFESSIONS, PRODUCTION_TYPES, PROJECT_MEDIA_ASPECT_RATIO } from '~/utils/constants';
import { monthOptions, yearOptions } from '~/utils/dateOptions';
import Select from '~/components/Select.vue';
import FileUpload from '~/components/FileUpload.vue';
import Button from '~/components/Button.vue';

// Seeds a draft from `initial` (undefined = new) and exposes commit(), which
// validates and returns a Project or null.
const props = defineProps<{
  initial?: Project;
}>();

const { t, locale } = useI18n();

type ProjectDraft = {
  name: string;
  nameOriginal: string;
  type: string[];
  position: string[];
  workInProgress: boolean;
  year: string;
  month: string;
  link: string;
  description: string;
  media: string;
};

const blank = (): ProjectDraft => ({
  name: '', nameOriginal: '', type: [], position: [], workInProgress: false,
  year: '', month: '', link: '', description: '', media: '',
});

const draft = ref<ProjectDraft>(
  props.initial
    ? {
        name: props.initial.name,
        nameOriginal: props.initial.nameOriginal ?? '',
        type: toArray<string>(props.initial.type),
        position: toArray<string>(props.initial.position),
        workInProgress: props.initial.workInProgress ?? false,
        year: props.initial.year != null ? String(props.initial.year) : '',
        month: props.initial.month != null ? String(props.initial.month) : '',
        link: props.initial.link ?? '',
        description: props.initial.description ?? '',
        media: props.initial.media ?? '',
      }
    : blank(),
);
const errors = reactive({ name: '', type: '', position: '', date: '', link: '' });

// FileUpload needs a v-model (the file id), but the URL we store arrives via
// @upload:complete. Seeded blank: existing media is already a URL in `draft`.
const mediaFileId = ref('');

// ALL_PROFESSIONS, not just crew: an actor's credit on a project is as real
// as a gaffer's, and talents fill this form too.
const professionItems = computed(() => ALL_PROFESSIONS.map(id => ({ value: id, title: t(id) })));
const productionTypeItems = computed(() => PRODUCTION_TYPES.map(id => ({ value: id, title: t(id) })));
const months = computed(() => monthOptions(locale.value));
const years = yearOptions();

const onMediaUploaded = (file: UploadedFile) => {
  draft.value.media = file.url;
};
const removeMedia = () => {
  draft.value.media = '';
  mediaFileId.value = '';
};

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

const commit = (): Project | null => {
  errors.name = '';
  errors.type = '';
  errors.position = '';
  errors.date = '';
  errors.link = '';

  const d = draft.value;
  let ok = true;
  if (!d.name.trim()) {
    errors.name = t('common_this_field_is_required');
    ok = false;
  }
  if (d.type.length === 0) {
    errors.type = t('common_this_field_is_required');
    ok = false;
  }
  if (d.position.length === 0) {
    errors.position = t('common_this_field_is_required');
    ok = false;
  }
  // A work-in-progress has no release date; otherwise both parts are required.
  if (!d.workInProgress && (!d.year || !d.month)) {
    errors.date = t('common_this_field_is_required');
    ok = false;
  }

  // Be forgiving with a bare host (matches the portfolio-link field).
  const rawLink = d.link.trim();
  const normalizedLink = rawLink && !/^https?:\/\//i.test(rawLink) ? `https://${rawLink}` : rawLink;
  if (rawLink && !URL_RE.test(normalizedLink)) {
    errors.link = t('register_portfolio_invalid_url');
    ok = false;
  }
  if (!ok) return null;

  return {
    name: d.name.trim(),
    ...(d.nameOriginal.trim() ? { nameOriginal: d.nameOriginal.trim() } : {}),
    type: d.type,
    position: d.position,
    workInProgress: d.workInProgress,
    ...(d.workInProgress ? {} : { year: Number(d.year), month: Number(d.month) }),
    ...(normalizedLink ? { link: normalizedLink } : {}),
    ...(d.description.trim() ? { description: d.description.trim() } : {}),
    ...(d.media ? { media: d.media } : {}),
  };
};

defineExpose({ commit });
</script>

<style scoped lang="scss">
.entity-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-row {
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
  }
}

.media-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-label {
  font-size: 14px;
  font-weight: 500;
}

.media-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-thumb {
  width: 96px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.media-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

@include mobile {
  // A labelled month/year pair doesn't survive half of a phone's width.
  .date-row {
    flex-direction: column;
  }

  .media-row {
    flex-wrap: wrap;
  }
}
</style>
