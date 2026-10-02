import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { regulationRepository } from "@/repositories/content.repository";
import { regulationSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@prisma/client";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import slugify from "slugify";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const { data, total } = await regulationRepository.findAll({ skip, limit, search, status });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = regulationSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  let slug = slugify(parsed.data.title, { lower: true, strict: true });
  const existing = await regulationRepository.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  const regulation = await regulationRepository.create({
    title: parsed.data.title,
    slug,
    description: parsed.data.description ?? null,
    fileUrl: parsed.data.fileUrl,
    fileId: parsed.data.fileId ?? null,
    fileName: parsed.data.fileName ?? null,
    status: (parsed.data.status as ContentStatus) ?? "DRAFT",
    publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
  });

  await createAuditLog({ userId: user.id, action: "CREATE", entityType: "Regulation", entityId: regulation.id, newData: regulation });
  return ApiResponse.created(regulation, "Regulasi berhasil dibuat");
});
