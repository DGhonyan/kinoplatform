<template>
  <PopupShell
    v-model="open"
    :title="$t('cropper_title')"
    :max-width="600"
  >
    <div class="cropper-layout">
      <Cropper
        ref="cropperRef"
        class="cropper"
        :src="src"
        :stencil-props="{ aspectRatio }"
        image-restriction="fit-area"
        @change="onChange"
      />

      <div class="preview-col">
        <span class="preview-label">{{ $t('cropper_preview') }}</span>
        <!-- Mirrors the profile container so users see the exact fit. -->
        <div
          class="preview-frame"
          :style="frameStyle"
        >
          <Preview
            v-if="result.image"
            :width="previewSize.w"
            :height="previewSize.h"
            :image="result.image"
            :coordinates="result.coordinates"
          />
        </div>
      </div>
    </div>

    <template #actions>
      <Button
        variant="secondary"
        color="accent"
        size="large"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        color="accent"
        size="large"
        :loading="processing"
        @click="confirm"
      >
        {{ $t('common_done') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import { Cropper, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Button from '~/components/Button.vue';

// Crop-before-upload dialog. Locks the crop box to the target's aspect ratio and
// emits the result re-encoded to WebP for the normal upload flow.
const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  /** Object URL of the picked image. */
  src: string;
  /** Target aspect ratio (width / height) — matches the profile container. */
  aspectRatio: number;
}>();

const emit = defineEmits<{
  confirm: [blob: Blob];
}>();

// The cropper's imperative handle + its latest result (for the live preview).
type CropChange = { coordinates: object | null; image: object | null };
const cropperRef = ref<{ getResult: () => { canvas: HTMLCanvasElement | null } } | null>(null);
const result = ref<CropChange>({ coordinates: null, image: null });
const processing = ref(false);

const onChange = (change: CropChange) => {
  result.value = change;
};

// Preview box sized to the target ratio (fixed height, derived width).
const previewSize = computed(() => {
  const h = 150;
  return { w: Math.round(h * props.aspectRatio), h };
});
const frameStyle = computed(() => ({
  width: `${previewSize.value.w}px`,
  height: `${previewSize.value.h}px`,
}));

const confirm = () => {
  const canvas = cropperRef.value?.getResult().canvas;
  if (!canvas) return;
  processing.value = true;
  canvas.toBlob(
    (blob) => {
      processing.value = false;
      if (!blob) return;
      emit('confirm', blob);
      open.value = false;
    },
    'image/webp',
    0.9,
  );
};
</script>

<style scoped lang="scss">
.cropper-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.cropper {
  flex: 1 1 320px;
  height: 340px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
}

.preview-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}

.preview-frame {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid color(--v-theme-accent, 0.4);
  background: #454545;
}
</style>
