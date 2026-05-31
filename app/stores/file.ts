import { defineStore } from 'pinia';

const blobStorageClient = new BlobStorageClient(SAS_TOKEN, {
  fileApiReadUrl: FILE_API_URL,
});
const containerName = 'kinoplatform';

export const useFileStore = defineStore('file', {
  actions: {
    async uploadFile(
      file: File,
      blobName: string,
      metadata: Record<string, string> = {},
      onProgressCallback?: (percent: number) => void,
    ) {
      await blobStorageClient.uploadFile({
        containerName,
        blobName,
        fileContent: file,
        metadata,
        onProgressCallback,
      });

      return blobName;
    },

    getFileMetadata(blobName: string) {
      return blobStorageClient.getFileMetadata(containerName, blobName);
    },

    composeFileUrl(blobName: string) {
      return blobStorageClient.composeFileUrl(`${containerName}/${blobName}`);
    },

    getFileUrl(blobName: string) {
      return this.composeFileUrl(blobName);
    },
  },
});
