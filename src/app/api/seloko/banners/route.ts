import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { bannerRepository } from "@/repositories/content.repository";
import { bannerSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;
  const activeParam = searchParams.get("active");
  const isActive = activeParam === "true" ? true : activeParam === "false" ? false : undefined;

  const { data, total } = await bannerRepository.findAll({ skip, limit, search, isActive });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:banners")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const banner = await bannerRepository.create(parsed.data);
  return ApiResponse.created(banner, "Banner berhasil dibuat");
});
