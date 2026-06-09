import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uploadFile } from "@/lib/imagekit";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { MediaFolderPath } from "@/lib/media-folders";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "/bapenda/uploads";

  if (!file) throw new ValidationError("File wajib diisi");

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) throw new ValidationError("Ukuran file maksimal 5MB");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError("Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, file.name, folder as MediaFolderPath);

  return ApiResponse.created(result, "Gambar berhasil diupload");
});
