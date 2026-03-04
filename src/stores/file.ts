import { defineStore } from 'pinia';
import { BlobStorageClient } from '@/common/file-util/file';
import { SAS_TOKEN, FILE_API_URL } from '@/common/constants';

export const useFileStore = defineStore('file', {
  state: (): {
    blobStorageClient: BlobStorageClient;
    containerName: string;
  } => ({
    blobStorageClient: new BlobStorageClient(SAS_TOKEN, {
      fileApiReadUrl: FILE_API_URL,
    }),
    containerName: 'kinoplatform',
  }),

  actions: {
    async uploadFile(
      file: File, 
      blobName: string, 
      metadata: Record<string, string> = {},
      onProgressCallback?: (percent: number) => void
    ) {
      await this.blobStorageClient.uploadFile({
        containerName: this.containerName,
        blobName,
        fileContent: file,
        metadata,
        onProgressCallback,
      });

      return blobName;
    },

    getFileMetadata(blobName: string) {
      return this.blobStorageClient.getFileMetadata(this.containerName, blobName);
    },

    composeFileUrl(blobName: string) {
      return this.blobStorageClient.composeFileUrl(`${this.containerName}/${blobName}`);
    },

    getFileUrl(blobName: string) {
      return this.composeFileUrl(blobName);
    },
  },
});