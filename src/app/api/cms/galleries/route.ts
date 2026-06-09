import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { galleryRepository } from "@/repositories/gallery.repository";
import { gallerySchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { ContentStatus } from "@prisma/client";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const status = searchParams.get("status") as ContentStatus | null;
  const search = searchParams.get("search") || undefined;
  const authorId = user.role === "Editor" || user.role === "Admin_Uptd" ? user.id : undefined;

  const { data, total } = await galleryRepository.findAll({
    skip, limit, status: status || undefined, authorId, search,
  });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "create:gallery")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const gallery = await galleryRepository.create({ ...parsed.data, authorId: user.id });
  return ApiResponse.created(gallery, "Galeri berhasil dibuat");
});
