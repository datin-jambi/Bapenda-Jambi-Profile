import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { pageRepository } from "@/repositories/content.repository";
import { pageSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { hasPermission } from "@/types";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const search = searchParams.get("search") ?? undefined;
  const statusParam = searchParams.get("status");
  const isPublished =
    statusParam === "published" ? true : statusParam === "draft" ? false : undefined;

  const { data, total } = await pageRepository.findPaginated({
    skip: (page - 1) * limit,
    limit,
    search,
    isPublished,
  });

  return ApiResponse.paginated(data, { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:pages")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const created = await pageRepository.create(parsed.data);
  return ApiResponse.created(created, "Halaman berhasil dibuat");
});
