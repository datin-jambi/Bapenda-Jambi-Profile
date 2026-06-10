import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uploadFile } from "@/lib/imagekit";
import { buildImageFileName } from "@/lib/upload-helpers";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { MediaFolder } from "@/lib/media-folders";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const label = (formData.get("label") as string) || "";

  if (!file) throw new ValidationError("File wajib diisi");

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new ValidationError("Hanya file PDF yang diizinkan");
  }

  if (file.size > MAX_SIZE) {
    throw new ValidationError("Ukuran file maksimal 20MB");
  }

  const fileName = buildImageFileName("regulation", label || file.name.replace(".pdf", "")) + ".pdf";
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, fileName, MediaFolder.REGULATION);

  return ApiResponse.created(
    { url: result.url, fileId: result.fileId, fileName: file.name },
    "File PDF berhasil diupload"
  );
});
