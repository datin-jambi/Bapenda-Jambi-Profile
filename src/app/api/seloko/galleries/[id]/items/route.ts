import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { galleryRepository } from "@/repositories/gallery.repository";
import { galleryItemSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

export const POST = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const parsed = galleryItemSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);

  const item = await galleryRepository.addItem(id, parsed.data);
  return ApiResponse.created(item, "Item berhasil ditambahkan");
});
