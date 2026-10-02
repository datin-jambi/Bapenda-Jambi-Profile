import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { galleryRepository } from "@/repositories/gallery.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError } from "@/lib/errors";

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { itemId } = await resolveParams(ctx);

  await galleryRepository.deleteItem(itemId);
  return ApiResponse.deleted("Item berhasil dihapus");
});
