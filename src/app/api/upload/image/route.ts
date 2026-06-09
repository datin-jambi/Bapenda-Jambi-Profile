import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uploadFile } from "@/lib/imagekit";
import { buildImageFileName } from "@/lib/upload-helpers";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { MediaFolderPath, MediaFolder } from "@/lib/media-folders";

const VALID_FOLDERS = new Set<string>(Object.values(MediaFolder));

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folderRaw = (formData.get("folder") as string) || MediaFolder.PROFILE;
  const module = (formData.get("module") as string) || "";
  const label = (formData.get("label") as string) || "";

  if (!file) throw new ValidationError("File wajib diisi");

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) throw new ValidationError("Ukuran file maksimal 5MB");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError("Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF");
  }

  // Resolve folder — accept both valid MediaFolderPath and shorthand like "/banners"
  const folder: MediaFolderPath = VALID_FOLDERS.has(folderRaw)
    ? (folderRaw as MediaFolderPath)
    : MediaFolder.PROFILE;

  // Use slug-based name when module+label provided, otherwise fall back to original filename
  const fileName = module && label
    ? buildImageFileName(module, label)
    : file.name;

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, fileName, folder);

  return ApiResponse.created(result, "Gambar berhasil diupload");
});
