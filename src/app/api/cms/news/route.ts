import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { newsRepository } from "@/repositories/news.repository";
import { newsSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@prisma/client";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";
import slugify from "slugify";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const status = searchParams.get("status") as ContentStatus | null;
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!, 10)
    : undefined;
  const search = searchParams.get("search") || undefined;

  const authorId =
    user.role === "Editor" || user.role === "Admin_Uptd" || user.role === "Ketua_Uptd"
      ? user.id
      : undefined;

  const { data, total } = await newsRepository.findAll({
    skip, limit, page, status: status || undefined, categoryId, search, authorId,
  });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "create:news")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  let slug = slugify(parsed.data.title, { lower: true, strict: true });

  // Ensure slug uniqueness
  const existing = await newsRepository.findBySlug(slug);
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  let status: ContentStatus = "DRAFT";
  if (user.role === "Admin_Uptd" || user.role === "Editor") status = "PENDING_REVIEW";

  const news = await newsRepository.create({
    ...parsed.data, slug, authorId: user.id, status,
  });

  await createAuditLog({ userId: user.id, action: "CREATE", entityType: "News", entityId: news.id, newData: news });
  return ApiResponse.created(news, "Berita berhasil dibuat");
});
