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
        :kind="kind"
        :aspect-ratio="aspectRatio ?? undefined"
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
import type { FileKind, UploadedFile } from '~~/shared/types/file';
import { ACTOR_PHOTO_ASPECT_RATIO } from '~/utils/constants';
import FileUpload from '~/components/FileUpload.vue';

// Photo grid with an add tile. `aspectRatio` decides whether cropping happens at
// all: set locks every photo to it, `null` skips the cropper and keeps originals.
const modelValue = defineModel<string[]>({ required: true });

const props = withDefaults(defineProps<{
  min?: number;
  max?: number;
  /** Storage bucket the uploads land in — locations use their own kind. */
  kind?: FileKind;
  /** Crop ratio (w / h), or `null` to upload the original uncropped. */
  aspectRatio?: number | null;
}>(), {
  min: 2,
  max: 6,
  kind: 'actor_photo',
  aspectRatio: ACTOR_PHOTO_ASPECT_RATIO,
});

// The tile follows the crop ratio. With cropping off the photos are arbitrary, and
// a fixed 3:4 box letterboxes a 16:9 room shot down to ~40% of the tile.
const tileRatio = computed(() => String(props.aspectRatio ?? 4 / 3));

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
  // Width is fixed; height follows the crop ratio via v-bind (see tileRatio),
  // so a landscape gallery gets landscape tiles instead of letterboxed slivers.
  width: 112px;
  aspect-ratio: v-bind(tileRatio);
  border-radius: 10px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    // `contain`, not `cover`: with cropping off these are arbitrary ratios, and
    // a cover thumb would re-crop exactly what we just chose not to crop.
    object-fit: contain;
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
  width: 112px;
  aspect-ratio: v-bind(tileRatio);
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
