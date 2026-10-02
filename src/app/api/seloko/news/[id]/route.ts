import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { newsRepository } from "@/repositories/news.repository";
import { newsSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@prisma/client";
import { hasPermission, canPublish } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError, BadRequestError } from "@/lib/errors";
import { safeDeleteFile } from "@/lib/upload-helpers";
import slugify from "slugify";

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  const news = await newsRepository.findById(id);
  if (!news) throw new NotFoundError("Berita tidak ditemukan");
  return ApiResponse.success(news);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const news = await newsRepository.findById(id);
  if (!news) throw new NotFoundError("Berita tidak ditemukan");

  const isOwner = news.author.id === user.id;
  if (!hasPermission(user.role, "edit:news") && !isOwner) throw new ForbiddenError();

  const body = await request.json();
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug = parsed.data.title !== news.title
    ? await (async () => {
        const base = slugify(parsed.data.title, { lower: true, strict: true });
        const existing = await newsRepository.findBySlug(base);
        return existing && existing.id !== id ? `${base}-${Date.now()}` : base;
      })()
    : news.slug;

  // Delete old thumbnail from ImageKit if replaced
  const newThumbnailUrl = parsed.data.thumbnailUrl ?? null;
  if (body.oldThumbnailFileId && newThumbnailUrl !== news.thumbnailUrl) {
    await safeDeleteFile(body.oldThumbnailFileId);
  }

  const updated = await newsRepository.update(id, { ...parsed.data, slug });
  await createAuditLog({ userId: user.id, action: "UPDATE", entityType: "News", entityId: id, oldData: news, newData: updated });
  return ApiResponse.updated(updated, "Berita berhasil diperbarui");
});

export const PATCH = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const { action } = body;

  const news = await newsRepository.findById(id);
  if (!news) throw new NotFoundError("Berita tidak ditemukan");

  if (action === "set-thumbnail") {
    const isOwner = news.author.id === user.id;
    if (!hasPermission(user.role, "edit:news") && !isOwner) throw new ForbiddenError();
    const updated = await newsRepository.update(id, { thumbnailUrl: body.thumbnailUrl ?? null });
    return ApiResponse.updated(updated, "Thumbnail berhasil diperbarui");
  }

  let newStatus: ContentStatus | null = null;
  if (action === "submit") newStatus = "PENDING_REVIEW";
  else if (action === "approve") {
    if (!hasPermission(user.role, "approve:news")) throw new ForbiddenError();
    newStatus = "APPROVED";
  } else if (action === "reject") {
    if (!hasPermission(user.role, "approve:news")) throw new ForbiddenError();
    newStatus = "REJECTED";
  } else if (action === "publish") {
    if (!canPublish(user.role)) throw new ForbiddenError();
    newStatus = "PUBLISHED";
  } else if (action === "unpublish") {
    if (!canPublish(user.role)) throw new ForbiddenError();
    newStatus = "DRAFT";
  }

  if (!newStatus) throw new BadRequestError("Aksi tidak valid");

  const updated = await newsRepository.update(id, {
    status: newStatus,
    publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
  });

  await createAuditLog({ userId: user.id, action: action.toUpperCase(), entityType: "News", entityId: id, oldData: { status: news.status }, newData: { status: newStatus } });
  return ApiResponse.updated(updated, "Status berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "delete:content")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const news = await newsRepository.findById(id);
  if (!news) throw new NotFoundError("Berita tidak ditemukan");

  await newsRepository.delete(id);
  await createAuditLog({ userId: user.id, action: "DELETE", entityType: "News", entityId: id, oldData: news });
  return ApiResponse.deleted("Berita berhasil dihapus");
});
