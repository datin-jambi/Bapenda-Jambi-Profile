import slugify from "slugify";
import { uploadFile, deleteFile, UploadResult } from "./imagekit";
import { MediaFolderPath } from "./media-folders";

/**
 * Build a clean, unique filename for ImageKit uploads.
 *
 * Format: {module}-{slug}-{timestamp}
 * Example: news-pajak-daerah-1749456789
 *
 * - slug is derived from a human-readable label (e.g. news title)
 * - truncated to 40 chars to keep filenames short
 * - timestamp ensures uniqueness
 */
export function buildImageFileName(module: string, label: string): string {
  const slug = slugify(label, { lower: true, strict: true }).slice(0, 40);
  const ts = Math.floor(Date.now() / 1000);
  return `${module}-${slug}-${ts}`;
}

/**
 * Upload a file buffer to ImageKit using a slug-based filename.
 */
export async function uploadImage(
  buffer: Buffer,
  module: string,
  label: string,
  folder: MediaFolderPath
): Promise<UploadResult> {
  const fileName = buildImageFileName(module, label);
  return uploadFile(buffer, fileName, folder);
}

/**
 * Delete a file from ImageKit by fileId, silently ignoring errors
 * (e.g. file already deleted, invalid id).
 */
export async function safeDeleteFile(fileId: string | null | undefined): Promise<void> {
  if (!fileId) return;
  try {
    await deleteFile(fileId);
  } catch {
    // best-effort: log but don't throw
    console.warn(`[ImageKit] Failed to delete fileId=${fileId}`);
  }
}
