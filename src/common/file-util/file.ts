import { BlobServiceClient, type HttpRequestBody } from '@azure/storage-blob';
import mime from 'mime';

const activeUploadControllers: Map<string, AbortController> = new Map();
export class BlobStorageClient {
  private blobServiceClient: BlobServiceClient;

  constructor(
    private sasToken: string,
    private readonly config: {
      fileApiReadUrl: string;
    },
  ) {
    // Initialize the BlobServiceClient with the storage account URL and the SAS token
    this.blobServiceClient = new BlobServiceClient(
      `${this.config.fileApiReadUrl}?${this.sasToken}`,
    );
  }

  async uploadFile({
    containerName,
    blobName,
    fileContent,
    metadata = {},
    onProgressCallback,
  }: {
    containerName: string;
    blobName: string;
    fileContent: HttpRequestBody & File;
    metadata?: Record<string, string>;
    onProgressCallback?: (percent: number) => void;
  }) {
    try {
      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);
      const containerExists = await containerClient.exists();

      if (!containerExists) {
        const containerCreateResponse = await containerClient.createIfNotExists(
          {
            access: 'blob',
          },
        );

        if (!containerCreateResponse.succeeded) {
          console.error(
            `Container creation failed: ${containerCreateResponse._response}`,
          );
          return;
        }
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const metadataDetails = {
        Filename: fileContent.name,
        Owner: containerName,
        Tags: metadata.tags ? JSON.stringify(metadata.tags) : '',
        ...metadata,
      };

      const mimeType = this.getFileMimeType(fileContent.name);

      const metadataEncrypted = Object.fromEntries(
        Object.entries(metadataDetails).map(([k, v]) => [
          k,
          encodeURIComponent(v),
        ]),
      );

      const abortController = new AbortController();
      const blockSize = 4 * 1024 * 1024; // 4 MB chunks
      const maxSingleShotSize = 5 * 1024 * 1024; // 5 MB
      const concurrency = 5;
      let lastPercent = 0;

      activeUploadControllers.set(blobName, abortController);

      await blockBlobClient.uploadData(fileContent, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
        metadata: metadataEncrypted,
        abortSignal: abortController.signal,
        maxSingleShotSize,
        blockSize,
        concurrency,

        onProgress: (p) => {
          const percent = Math.round((p.loadedBytes / fileContent.size) * 100);
          if (percent !== lastPercent) {
            lastPercent = percent;
            if (onProgressCallback) {
              onProgressCallback(percent);
            }
          }
        },
      });
      activeUploadControllers.delete(blobName);
    } catch (error) {
      activeUploadControllers.delete(blobName);
      console.error('Error uploading file:', error);
      // We do that so the users of this function will know if error happens
      throw new Error('Error uploading file');
    }
  }

  async getFileMetadata(containerName: string, blobName: string) {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const properties = await blockBlobClient.getProperties();

    return {
      name: properties?.metadata?.filename,
      type: properties.contentType,
      date_created: properties.createdOn,
      size: properties.contentLength,
    };
  }

  isUrl(string: string) {
    try {
      return !!new URL(string);
    } catch (_) {
      return false;
    }
  }

  composeFileUrl(
    blobName: string,
  ) {
    return `${this.config.fileApiReadUrl}${blobName}`;
  }

  getFileMimeType(filename: string): string {
    return mime.getType(filename) ?? 'application/octet-stream';
  }

  cancelUpload(blobName: string): boolean {
    if (!blobName) return false;
    const controller = activeUploadControllers.get(blobName);
    if (!controller) return false;

    controller.abort();
    activeUploadControllers.delete(blobName);
    return true;
  }
}
