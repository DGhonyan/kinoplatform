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
}>(), {
  label: '',
  required: false,
  accept: 'image/*',
  placeholder: 'Choose file',
  helperText: '',
  autoUpload: true,
  color: 'primary',
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

const handleFileSelect = async (files: File | File[] | null) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];
  const file = fileArray[0];
  if (!file) return;

  if (props.autoUpload) {
    await uploadFile(file);
  }
};

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const handleNativeFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  // Reset so re-selecting the same file still fires `change`.
  target.value = '';
  if (!file) return;

  if (props.autoUpload) {
    await uploadFile(file);
  }
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
