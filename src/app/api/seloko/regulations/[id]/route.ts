import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { regulationRepository } from "@/repositories/content.repository";
import { regulationSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@prisma/client";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { safeDeleteFile } from "@/lib/upload-helpers";
import slugify from "slugify";

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  const regulation = await regulationRepository.findById(id);
  if (!regulation) throw new NotFoundError("Regulasi tidak ditemukan");
  return ApiResponse.success(regulation);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const regulation = await regulationRepository.findById(id);
  if (!regulation) throw new NotFoundError("Regulasi tidak ditemukan");

  const body = await request.json();
  const parsed = regulationSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  let slug = regulation.slug;
  if (parsed.data.title !== regulation.title) {
    const base = slugify(parsed.data.title, { lower: true, strict: true });
    const existing = await regulationRepository.findBySlug(base);
    slug = existing && existing.id !== id ? `${base}-${Date.now()}` : base;
  }

  if (body.oldFileId && parsed.data.fileUrl !== regulation.fileUrl) {
    await safeDeleteFile(body.oldFileId);
  }

  const wasPublished = regulation.status === "PUBLISHED";
  const nowPublished = parsed.data.status === "PUBLISHED";

  const updated = await regulationRepository.update(id, {
    title: parsed.data.title,
    slug,
    description: parsed.data.description ?? null,
    fileUrl: parsed.data.fileUrl,
    fileId: parsed.data.fileId ?? null,
    fileName: parsed.data.fileName ?? null,
    status: (parsed.data.status as ContentStatus) ?? "DRAFT",
    publishedAt: nowPublished && !wasPublished ? new Date() : (!nowPublished ? null : regulation.publishedAt),
  });

  await createAuditLog({ userId: user.id, action: "UPDATE", entityType: "Regulation", entityId: id, oldData: regulation, newData: updated });
  return ApiResponse.updated(updated, "Regulasi berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const regulation = await regulationRepository.findById(id);
  if (!regulation) throw new NotFoundError("Regulasi tidak ditemukan");

  if (regulation.fileId) await safeDeleteFile(regulation.fileId);

  await regulationRepository.delete(id);
  await createAuditLog({ userId: user.id, action: "DELETE", entityType: "Regulation", entityId: id, oldData: regulation });
  return ApiResponse.deleted("Regulasi berhasil dihapus");
});
