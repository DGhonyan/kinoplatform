<template>
  <div class="file-upload">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="asterisk"> * </span>
    </label>

    <div class="upload-area">
      <div v-if="!uploadedUrl && !uploading" class="upload-input">
        <v-file-input
          v-model="selectedFile"
          :accept="accept"
          variant="outlined"
          prepend-inner-icon="mdi-paperclip"
          :label="placeholder"
          hide-details="auto"
          :error-messages="errorMessages"
          @update:model-value="handleFileSelect"
        />
      </div>

      <div v-if="uploading" class="upload-progress">
        <v-progress-linear
          :model-value="uploadProgress"
          color="primary"
          height="25"
        >
          <template v-slot:default>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </template>
        </v-progress-linear>
      </div>

      <div v-if="uploadedUrl && !uploading" class="upload-success">
        <div v-if="isImage" class="image-preview">
          <img :src="previewUrl" alt="Uploaded file" />
        </div>
        <div class="file-info">
          <v-icon color="success">mdi-check-circle</v-icon>
          <span>{{ fileName }}</span>
        </div>
        <v-btn
          size="small"
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="removeFile"
        />
      </div>
    </div>

    <span v-if="helperText" class="helper-text">{{ helperText }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useFileStore } from '@/stores/file';
import { useAppStore } from '@/stores/app';

const props = withDefaults(defineProps<{
  label?: string;
  required?: boolean;
  accept?: string;
  placeholder?: string;
  helperText?: string;
  errorMessages?: string | string[];
  modelValue?: string;
  autoUpload?: boolean;
}>(), {
  label: '',
  required: false,
  accept: 'image/*',
  placeholder: 'Choose file',
  helperText: '',
  autoUpload: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'upload:progress', progress: number): void;
  (e: 'upload:complete', blobName: string, url: string): void;
  (e: 'upload:error', error: Error): void;
}>();

const fileStore = useFileStore();
const appStore = useAppStore();

const { composeFileUrl, uploadFile: uploadFileStore } = fileStore;

const selectedFile = ref<File[] | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedUrl = ref('');
const fileName = ref('');

const isImage = computed(() => {
  return fileName.value && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName.value);
});

const previewUrl = computed(() => {
  if (uploadedUrl.value) {
    return composeFileUrl(uploadedUrl.value);
  }
  return '';
});

watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== uploadedUrl.value) {
    uploadedUrl.value = newValue;
    fileName.value = newValue.split('/').pop() || 'File';
  }
});

const handleFileSelect = async (files: File | File[] | null) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];
  if (fileArray.length === 0) return;

  const file = fileArray[0];
  if (!file) return;

  fileName.value = file.name;

  if (props.autoUpload) {
    await uploadFile(file);
  }
};

const uploadFile = async (file: File) => {
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const timestamp = Date.now();
    const blobName = `${timestamp}-${file.name}`;

    await uploadFileStore(
      file,
      blobName,
      {},
      (progress) => {
        uploadProgress.value = progress;
        emit('upload:progress', progress);
      }
    );

    uploadedUrl.value = blobName;
    emit('update:modelValue', blobName);
    emit('upload:complete', blobName, previewUrl.value);
  } catch (error) {
    console.error('Upload failed:', error);
    appStore.showMessage('File upload failed. Please try again.', 'error');
    emit('upload:error', error as Error);
  } finally {
    uploading.value = false;
  }
};

const removeFile = () => {
  selectedFile.value = null;
  uploadedUrl.value = '';
  fileName.value = '';
  uploadProgress.value = 0;
  emit('update:modelValue', '');
};

defineExpose({
  uploadFile,
  removeFile,
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
  color: color(--v-theme-gray);
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
  border: 1px solid rgba(var(--v-theme-success), 0.3);
  border-radius: 4px;
  background-color: rgba(var(--v-theme-success), 0.05);
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
    color: color(--v-theme-gray);
    word-break: break-all;
  }
}

.helper-text {
  font-size: 12px;
  color: color(--v-theme-gray);
  opacity: 0.7;
}
</style>
