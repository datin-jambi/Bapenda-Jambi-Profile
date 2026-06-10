import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { settingRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const settings = await settingRepository.findAll();
  return ApiResponse.success(settings);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:settings")) throw new ForbiddenError();

  const body = await request.json();
  await settingRepository.upsertMany(body);
  return ApiResponse.updated(null, "Pengaturan berhasil disimpan");
});
