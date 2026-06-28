import { defineStore } from 'pinia';
import type {
  FileKind,
  InitiateUploadResponse,
  UploadedFile,
} from '~~/shared/types/file';

/**
 * Raw PUT of the bytes straight to Azure using the backend-issued SAS URL.
 * Deliberately bypasses the app API client: no app cookies/credentials are sent
 * to blob storage — the SAS is the only authorization. Uses XHR for upload
 * progress (fetch can't report it). Resolves true on a 2xx response.
 */
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
    /**
     * Three-step direct-to-Azure upload:
     *   1) POST /files/initiate  → short-lived, write-only SAS URL
     *   2) PUT the bytes straight to Azure (progress via XHR)
     *   3) POST /files/:id/confirm → backend verifies the blob, returns the file
     * Returns the confirmed file (with an absolute `url`), or null on any failure
     * (the error snackbar is already shown by `apiRequest` / the PUT handler).
     */
    async uploadFile(
      file: File,
      kind: FileKind,
      onProgress?: (percent: number) => void,
    ): Promise<UploadedFile | null> {
      // No blanket errorMessage here: let the specific backend code surface its
      // own message (FILE_INVALID_TYPE → "use JPG/PNG/WebP", FILE_TOO_LARGE, …)
      // instead of a generic "upload failed".
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
