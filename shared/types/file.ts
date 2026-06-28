export type FileKind = 'avatar' | 'portfolio_file';

export type FileStatus = 'pending' | 'uploaded' | 'ready' | 'failed';

/** Response from POST /files/initiate — a one-time, write-only upload target. */
export type InitiateUploadResponse = {
  fileId: string;
  uploadUrl: string;
  blobName: string;
  method: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
};

export type FileVariant = {
  type: string;
  url: string;
  width: number | null;
  height: number | null;
};

/** A confirmed file as returned by /files/:id/confirm and /files/:id. */
export type UploadedFile = {
  _id: string;
  kind: FileKind;
  category: string;
  status: FileStatus;
  visibility: string;
  /** Absolute, ready-to-render URL (public URL or signed). */
  url: string;
  variants: FileVariant[];
  poster: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
