import { defineStore } from 'pinia';

export const useFileStore = defineStore('file', () => {
  const blobStorageClient = new BlobStorageClient(SAS_TOKEN, {
    fileApiReadUrl: FILE_API_URL,
  });
  const containerName = 'kinoplatform';

  async function uploadFile(
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
  }

  function getFileMetadata(blobName: string) {
    return blobStorageClient.getFileMetadata(containerName, blobName);
  }

  function composeFileUrl(blobName: string) {
    return blobStorageClient.composeFileUrl(`${containerName}/${blobName}`);
  }

  function getFileUrl(blobName: string) {
    return composeFileUrl(blobName);
  }

  return { blobStorageClient, containerName, uploadFile, getFileMetadata, composeFileUrl, getFileUrl };
});
