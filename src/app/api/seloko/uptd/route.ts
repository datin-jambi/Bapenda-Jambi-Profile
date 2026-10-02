import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uptdRepository } from "@/repositories/content.repository";
import { uptdSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);

  const search = searchParams.get("search") ?? undefined;

  const isActiveParam = searchParams.get("isActive");
  const isActive =
    isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;

  const hasUsersParam = searchParams.get("hasUsers");
  const hasUsers =
    hasUsersParam === "true" ? true : hasUsersParam === "false" ? false : undefined;

  const { data, total } = await uptdRepository.findPaginated({
    page, limit, skip, search, isActive, hasUsers,
  });

  const mapped = data.map((u) => ({ ...u, totalUser: u._count.users }));

  return ApiResponse.paginated(mapped, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:uptd")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = uptdSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const uptd = await uptdRepository.create(parsed.data);
  return ApiResponse.created(uptd, "UPTD berhasil dibuat");
});
