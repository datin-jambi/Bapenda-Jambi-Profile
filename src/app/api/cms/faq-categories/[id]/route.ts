import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { hasPermission } from "@/types";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const GET = withErrorHandler(async (_req: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await resolveParams(ctx);
  const category = await prisma.faqCategory.findUnique({
    where: { id, deletedAt: null },
    include: {
      _count: { select: { faqs: { where: { deletedAt: null } } } },
      faqs: {
        where: { deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, question: true, isPublished: true, viewCount: true, sortOrder: true, createdAt: true },
      },
    },
  });
  if (!category) throw new NotFoundError("Kategori tidak ditemukan");
  return ApiResponse.success(category);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const existing = await prisma.faqCategory.findUnique({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Kategori tidak ditemukan");

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  const updated = await prisma.faqCategory.update({
    where: { id },
    data: { ...parsed.data, slug },
  });
  return ApiResponse.updated(updated, "Kategori FAQ berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (_req: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const existing = await prisma.faqCategory.findUnique({
    where: { id, deletedAt: null },
    include: { _count: { select: { faqs: { where: { deletedAt: null } } } } },
  });
  if (!existing) throw new NotFoundError("Kategori tidak ditemukan");
  if (existing._count.faqs > 0) {
    throw new ValidationError(`Kategori tidak dapat dihapus karena masih memiliki ${existing._count.faqs} FAQ aktif`);
  }

  await prisma.faqCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  return ApiResponse.deleted("Kategori FAQ berhasil dihapus");
});
