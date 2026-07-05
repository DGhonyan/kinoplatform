<template>
  <div class="file-upload">
    <label
      v-if="label"
      class="label"
    >
      {{ $t(label) }}
      <span
        v-if="required"
        class="asterisk"
      > * </span>
    </label>

    <!-- Custom activator: caller renders the trigger; we expose `open` + state. -->
    <template v-if="$slots.activator">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple || undefined"
        class="hidden-input"
        @change="handleNativeFileSelect"
      >
      <slot
        name="activator"
        :open="openFilePicker"
        :uploading="uploading"
        :progress="uploadProgress"
        :preview-url="previewUrl"
        :file-name="fileName"
        :file-id="fileId"
        :remove="removeFile"
      />
    </template>

    <div
      v-else
      class="upload-area"
    >
      <div
        v-if="!fileId && !uploading"
        class="upload-input"
      >
        <v-file-input
          v-model="selectedFile"
          :accept="accept"
          variant="outlined"
          :label="$t(placeholder)"
          hide-details="auto"
          :error-messages="errorMessages"
          @update:model-value="handleFileSelect"
        />
      </div>

      <div
        v-if="uploading"
        class="upload-progress"
      >
        <v-progress-linear
          :model-value="uploadProgress"
          :color="resolvedColor"
          height="25"
        >
          <template #default>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </template>
        </v-progress-linear>
      </div>

      <div
        v-if="fileId && !uploading"
        class="upload-success"
      >
        <div
          v-if="isImage && previewUrl"
          class="image-preview"
        >
          <img
            :src="previewUrl"
            alt="Uploaded file"
          >
        </div>
        <div class="file-info">
          <v-icon color="success">
            mdi-check-circle
          </v-icon>
          <span>{{ fileName }}</span>
        </div>
        <Button
          size="small"
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="removeFile"
        />
      </div>
    </div>

    <span
      v-if="helperText"
      class="helper-text"
    >{{ $t(helperText) }}</span>

    <ImageCropperDialog
      v-if="cropOpen"
      v-model="cropOpen"
      :src="cropSrc"
      :aspect-ratio="aspectRatio ?? 1"
      @confirm="onCropConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FileKind, UploadedFile } from '~~/shared/types/file';

const props = withDefaults(defineProps<{
  kind: FileKind;
  label?: string;
  required?: boolean;
  accept?: string;
  placeholder?: string;
  helperText?: string;
  errorMessages?: string | string[];
  // v-model holds the confirmed file id (what you pass to the attach endpoints).
  modelValue?: string;
  autoUpload?: boolean;
  color?: string;
  /** When set, picked images open a crop dialog locked to this ratio (w / h)
   *  before uploading — so the stored image matches its profile container. */
  aspectRatio?: number;
  /** Allow selecting several files at once; each runs the crop→upload flow in turn. */
  multiple?: boolean;
  /** Cap a multi-select to this many files (e.g. the caller's remaining slots). */
  maxFiles?: number;
}>(), {
  label: '',
  required: false,
  accept: 'image/*',
  placeholder: 'Choose file',
  helperText: '',
  autoUpload: true,
  color: 'primary',
  multiple: false,
});

// Let callers pass theme tokens (incl. `on-*`) by name; resolveThemeColor turns
// the ones Vuetify can't (the `on-*` ones) into the working variable form.
const resolvedColor = computed(() => resolveThemeColor(props.color));

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'upload:progress', progress: number): void;
  (e: 'upload:complete', file: UploadedFile): void;
  (e: 'upload:error'): void;
}>();

const fileStore = useFileStore();

const selectedFile = ref<File[] | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
// Confirmed file id (mirrors v-model).
const fileId = ref(props.modelValue ?? '');
// Local object URL of the picked file, for instant preview (no network).
const previewUrl = ref('');
const fileName = ref('');

const isImage = computed(() => props.accept.includes('image'));

watch(() => props.modelValue, (value) => {
  if ((value ?? '') !== fileId.value) {
    fileId.value = value ?? '';
    if (!value) {
      previewUrl.value = '';
      fileName.value = '';
    }
  }
});

// A picked image either goes straight to upload, or (when aspectRatio is set)
// through the crop dialog first.
const cropOpen = ref(false);
const cropSrc = ref('');
const pendingName = ref('');

const handlePicked = (file: File) => {
  if (props.aspectRatio) {
    if (cropSrc.value) URL.revokeObjectURL(cropSrc.value);
    cropSrc.value = URL.createObjectURL(file);
    pendingName.value = file.name;
    cropOpen.value = true;
  }
  else if (props.autoUpload) {
    uploadFile(file);
  }
};

// Multi-select: cap to the caller's remaining slots, then run each file through
// the same crop→upload flow. Cropping is one-at-a-time, so the rest wait in a
// queue and open as each crop dialog closes (see the cropOpen watcher).
const cropQueue = ref<File[]>([]);

const handleMultiplePicked = (files: File[]) => {
  const cap = props.maxFiles && props.maxFiles > 0 ? props.maxFiles : files.length;
  const [first, ...rest] = files.slice(0, cap);
  if (!first) return;

  if (props.aspectRatio) {
    cropQueue.value = rest;
    handlePicked(first);
  }
  else {
    [first, ...rest].forEach(f => handlePicked(f));
  }
};

const advanceCropQueue = () => {
  const next = cropQueue.value.shift();
  // Let the dialog unmount this tick, then reopen fresh for the next file.
  if (next) nextTick(() => handlePicked(next));
};

const onCropConfirm = (blob: Blob) => {
  cropOpen.value = false; // the watcher below frees cropSrc
  const base = pendingName.value.replace(/\.[^.]+$/, '') || 'image';
  const cropped = new File([blob], `${base}.webp`, { type: blob.type || 'image/webp' });
  uploadFile(cropped);
};

// Free the crop object URL whenever the dialog closes (confirm, cancel, or X),
// then advance to the next queued file (a no-op for a single pick).
watch(cropOpen, (isOpen) => {
  if (isOpen) return;
  if (cropSrc.value) {
    URL.revokeObjectURL(cropSrc.value);
    cropSrc.value = '';
  }
  advanceCropQueue();
});

const handleFileSelect = (files: File | File[] | null) => {
  if (!files) return;
  const file = Array.isArray(files) ? files[0] : files;
  if (file) handlePicked(file);
};

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const handleNativeFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files ?? []);
  // Reset so re-selecting the same file(s) still fires `change`.
  target.value = '';
  const first = files[0];
  if (!first) return;
  if (props.multiple) handleMultiplePicked(files);
  else handlePicked(first);
};

const uploadFile = async (file: File) => {
  uploading.value = true;
  uploadProgress.value = 0;
  fileName.value = file.name;

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);

  const result = await fileStore.uploadFile(file, props.kind, (progress) => {
    uploadProgress.value = progress;
    emit('upload:progress', progress);
  });

  uploading.value = false;

  if (!result) {
    // Store already surfaced the error snackbar.
    emit('upload:error');
    return;
  }

  fileId.value = result._id;
  emit('update:modelValue', result._id);
  emit('upload:complete', result);
};

const removeFile = () => {
  selectedFile.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
  fileId.value = '';
  fileName.value = '';
  uploadProgress.value = 0;
  emit('update:modelValue', '');
};

defineExpose({
  uploadFile,
  removeFile,
  openFilePicker,
});
</script>

<style scoped lang="scss">
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
}

.asterisk {
  color: color(--v-theme-error);
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-progress {
  padding: 8px;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.upload-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid color(--v-theme-success, 0.3);
  border-radius: 4px;
  background-color: color(--v-theme-success, 0.05);
}

.image-preview {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  span {
    font-size: 14px;
    word-break: break-all;
  }
}

.helper-text {
  font-size: 12px;
  opacity: 0.7;
}

.hidden-input {
  display: none;
}
</style>
