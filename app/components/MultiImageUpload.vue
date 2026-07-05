<template>
  <div class="multi-photo">
    <div class="thumbs">
      <div
        v-for="(url, i) in modelValue"
        :key="url"
        class="thumb"
      >
        <img
          :src="url"
          alt=""
        >
        <button
          type="button"
          class="remove"
          :aria-label="$t('common_delete')"
          @click="removeAt(i)"
        >
          <v-icon size="16">
            mdi-close
          </v-icon>
        </button>
      </div>

      <!-- Add tile — the button hides at max, but FileUpload stays mounted so an
           in-flight multi-select crop queue isn't torn down. Each pick crops +
           uploads; a multi-select is capped to the remaining slots. -->
      <FileUpload
        kind="actor_photo"
        :aspect-ratio="ACTOR_PHOTO_ASPECT_RATIO"
        accept="image/jpeg,image/png,image/webp"
        multiple
        :max-files="max - modelValue.length"
        @upload:complete="onUploaded"
      >
        <template #activator="{ open: openPicker, uploading, progress }">
          <button
            v-if="modelValue.length < max"
            type="button"
            class="add"
            :disabled="uploading"
            :aria-label="$t('actor_photos_add')"
            @click="openPicker"
          >
            <v-progress-circular
              v-if="uploading"
              :model-value="progress"
              :size="28"
              :width="3"
              color="accent"
            />
            <v-icon
              v-else
              size="28"
            >
              mdi-plus
            </v-icon>
          </button>
        </template>
      </FileUpload>
    </div>

    <span class="hint">{{ $t('actor_photos_hint', { min, max }) }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { UploadedFile } from '~~/shared/types/file';
import { ACTOR_PHOTO_ASPECT_RATIO } from '~/utils/constants';
import FileUpload from '~/components/FileUpload.vue';

/**
 * Grid of actor photos with an add tile. Each add runs the standard crop+upload
 * flow (portrait ratio) and appends the confirmed public URL. min/max are the
 * product policy (2–6); min is enforced by the caller's validation.
 */
const modelValue = defineModel<string[]>({ required: true });

const props = withDefaults(defineProps<{ min?: number; max?: number }>(), {
  min: 2,
  max: 6,
});

const onUploaded = (file: UploadedFile) => {
  // Selection is already capped in FileUpload; guard here too so a late upload
  // completing can't push us past the max.
  if (modelValue.value.length >= props.max) return;
  modelValue.value = [...modelValue.value, file.url];
};
const removeAt = (i: number) => {
  modelValue.value = modelValue.value.filter((_, idx) => idx !== i);
};
</script>

<style scoped lang="scss">
.multi-photo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumb {
  position: relative;
  width: 84px;
  height: 112px; // 3:4 portrait, matches the crop ratio
  border-radius: 10px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
}

.add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 112px;
  border: 1px dashed color(--v-theme-on-surface, 0.4);
  border-radius: 10px;
  cursor: pointer;
  color: color(--v-theme-accent);
  background: color(--v-theme-on-surface, 0.03);

  &:hover {
    border-color: color(--v-theme-accent);
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.hint {
  font-size: 12px;
  opacity: 0.7;
}
</style>
