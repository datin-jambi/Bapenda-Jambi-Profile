import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { galleryRepository } from "@/repositories/gallery.repository";
import { gallerySchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission, canPublish } from "@/types";
import { ContentStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError, BadRequestError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  const gallery = await galleryRepository.findById(id);
  if (!gallery) throw new NotFoundError("Galeri tidak ditemukan");
  return ApiResponse.success(gallery);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  const gallery = await galleryRepository.findById(id);
  if (!gallery) throw new NotFoundError("Galeri tidak ditemukan");
  if (!hasPermission(user.role, "edit:gallery")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await galleryRepository.update(id, parsed.data);
  return ApiResponse.updated(updated, "Galeri berhasil diperbarui");
});

export const PATCH = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const { action } = body;

  const gallery = await galleryRepository.findById(id);
  if (!gallery) throw new NotFoundError("Galeri tidak ditemukan");

  // Partial update: cover image only
  if (action === "set-cover") {
    if (!hasPermission(user.role, "edit:gallery")) throw new ForbiddenError();
    const updated = await galleryRepository.update(id, { coverImage: body.coverImage ?? null });
    return ApiResponse.updated(updated, "Cover berhasil diperbarui");
  }

  let newStatus: ContentStatus | null = null;
  if (action === "submit") newStatus = "PENDING_REVIEW";
  else if (action === "approve") {
    if (!hasPermission(user.role, "approve:gallery")) throw new ForbiddenError();
    newStatus = "APPROVED";
  } else if (action === "reject") {
    if (!hasPermission(user.role, "approve:gallery")) throw new ForbiddenError();
    newStatus = "REJECTED";
  } else if (action === "publish") {
    if (!canPublish(user.role)) throw new ForbiddenError();
    newStatus = "PUBLISHED";
  } else if (action === "unpublish") {
    if (!canPublish(user.role)) throw new ForbiddenError();
    newStatus = "DRAFT";
  }

  if (!newStatus) throw new BadRequestError("Aksi tidak valid");

  const updated = await galleryRepository.update(id, { status: newStatus });
  await createAuditLog({ userId: user.id, action: action.toUpperCase(), entityType: "Gallery", entityId: id });
  return ApiResponse.updated(updated, "Status berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "delete:content")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const gallery = await galleryRepository.findById(id);
  if (!gallery) throw new NotFoundError("Galeri tidak ditemukan");

  await galleryRepository.delete(id);
  await createAuditLog({ userId: user.id, action: "DELETE", entityType: "Gallery", entityId: id });
  return ApiResponse.deleted("Galeri berhasil dihapus");
});
