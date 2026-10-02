import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { faqRepository } from "@/repositories/content.repository";
import { faqSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";

export const GET = withErrorHandler(async (_request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await resolveParams(ctx);
  const faq = await faqRepository.findById(id);
  if (!faq) throw new NotFoundError("FAQ tidak ditemukan");

  return ApiResponse.success(faq);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const faq = await faqRepository.findById(id);
  if (!faq) throw new NotFoundError("FAQ tidak ditemukan");

  const body = await request.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await faqRepository.update(id, user.id, parsed.data);
  return ApiResponse.updated(updated, "FAQ berhasil diperbarui");
});

export const PATCH = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const faq = await faqRepository.findById(id);
  if (!faq) throw new NotFoundError("FAQ tidak ditemukan");

  const body = await request.json();
  const parsed = faqSchema.partial().safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await faqRepository.update(id, user.id, parsed.data);
  return ApiResponse.updated(updated, "FAQ berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (_request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const faq = await faqRepository.findById(id);
  if (!faq) throw new NotFoundError("FAQ tidak ditemukan");

  await faqRepository.delete(id);
  return ApiResponse.deleted("FAQ berhasil dihapus");
});
