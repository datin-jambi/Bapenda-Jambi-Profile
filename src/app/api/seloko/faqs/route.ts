import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { faqRepository } from "@/repositories/content.repository";
import { faqSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!, 10)
    : undefined;
  const search = searchParams.get("search") ?? undefined;
  const publishedParam = searchParams.get("isPublished");
  const isPublished =
    publishedParam === "true" ? true : publishedParam === "false" ? false : undefined;

  const { data, total } = await faqRepository.findAll({ skip, limit, categoryId, isPublished, search });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const faq = await faqRepository.create({ ...parsed.data, authorId: user.id });
  return ApiResponse.created(faq, "FAQ berhasil dibuat");
});
