import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { pageRepository } from "@/repositories/content.repository";
import { pageSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const page = await pageRepository.findById(id);
  if (!page) throw new NotFoundError("Halaman tidak ditemukan");
  return ApiResponse.success(page);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:pages")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await pageRepository.update(id, parsed.data);
  return ApiResponse.updated(updated, "Halaman berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:pages")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const page = await pageRepository.findById(id);
  if (!page) throw new NotFoundError("Halaman tidak ditemukan");

  await pageRepository.delete(id);
  return ApiResponse.deleted("Halaman berhasil dihapus");
});
