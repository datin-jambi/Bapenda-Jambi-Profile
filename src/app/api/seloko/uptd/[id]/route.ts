import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uptdRepository } from "@/repositories/content.repository";
import { uptdSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const uptd = await uptdRepository.findByIdWithStats(Number(id));
  if (!uptd) throw new NotFoundError("UPTD tidak ditemukan");

  return ApiResponse.success(uptd);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:uptd")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const parsed = uptdSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);

  const updated = await uptdRepository.update(Number(id), parsed.data);
  return ApiResponse.updated(updated, "UPTD diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:uptd")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  await uptdRepository.delete(Number(id));
  return ApiResponse.deleted("UPTD dihapus");
});
