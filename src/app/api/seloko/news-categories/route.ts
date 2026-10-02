import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newsCategorySchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { hasPermission } from "@/types";
import { slugify } from "@/lib/utils";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") ?? undefined;
  const isActiveParam = searchParams.get("isActive");
  const isActive = isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;

  const where = {
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
  };

  const [data, total] = await Promise.all([
    prisma.newsCategory.findMany({
      where, skip, take: limit,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { news: { where: { deletedAt: null } } } } },
    }),
    prisma.newsCategory.count({ where }),
  ]);

  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:news")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = newsCategorySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  const category = await prisma.newsCategory.create({
    data: { ...parsed.data, slug },
  });
  return ApiResponse.created(category, "Kategori berita berhasil dibuat");
});
