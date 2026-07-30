import { defineStore } from 'pinia';
import type {
  FileKind,
  InitiateUploadResponse,
  UploadedFile,
} from '~~/shared/types/file';

// Bypasses the app API client on purpose: no app cookies reach blob storage —
// the SAS is the only authorization. XHR because fetch can't report progress.
function putToAzure(
  init: InitiateUploadResponse,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init.method, init.uploadUrl, true);

    Object.entries(init.requiredHeaders).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.onabort = () => resolve(false);
    xhr.send(file);
  });
}

export const useFileStore = defineStore('file', {
  actions: {
    // Direct-to-Azure upload: initiate (SAS URL) → PUT bytes → confirm.
    // Returns the confirmed file, or null on any failure (snackbar already shown).
    async uploadFile(
      file: File,
      kind: FileKind,
      onProgress?: (percent: number) => void,
    ): Promise<UploadedFile | null> {
      // No blanket errorMessage: let the specific backend code surface its own
      // message (FILE_INVALID_TYPE, FILE_TOO_LARGE) instead of "upload failed".
      const init = await apiRequest('/files/initiate').post<InitiateUploadResponse>({
        kind,
        contentType: file.type,
        size: file.size,
        originalFilename: file.name,
      });

      if (!init) return null;

      const uploaded = await putToAzure(init, file, onProgress);

      if (!uploaded) {
        useAppStore().showMessage('error_file_upload_failed', 'error');
        return null;
      }

      return apiRequest(`/files/${init.fileId}/confirm`, {
        errorMessage: 'error_file_upload_failed',
      }).post<UploadedFile>();
    },
  },
});
