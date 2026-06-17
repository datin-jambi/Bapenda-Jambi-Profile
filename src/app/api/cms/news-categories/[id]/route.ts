import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newsCategorySchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { hasPermission } from "@/types";
import { slugify } from "@/lib/utils";

export const GET = withErrorHandler(async (_req: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await resolveParams(ctx);
  const category = await prisma.newsCategory.findUnique({
    where: { id, deletedAt: null },
    include: {
      _count: { select: { news: { where: { deletedAt: null } } } },
      news: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, publishedAt: true, createdAt: true },
        take: 10,
      },
    },
  });
  if (!category) throw new NotFoundError("Kategori tidak ditemukan");
  return ApiResponse.success(category);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:news")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const existing = await prisma.newsCategory.findUnique({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Kategori tidak ditemukan");

  const body = await request.json();
  const parsed = newsCategorySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  const updated = await prisma.newsCategory.update({
    where: { id },
    data: { ...parsed.data, slug },
  });
  return ApiResponse.updated(updated, "Kategori berita berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (_req: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:news")) throw new ForbiddenError();

  const { id } = await resolveParams(ctx);
  const existing = await prisma.newsCategory.findUnique({
    where: { id, deletedAt: null },
    include: { _count: { select: { news: { where: { deletedAt: null } } } } },
  });
  if (!existing) throw new NotFoundError("Kategori tidak ditemukan");
  if (existing._count.news > 0) {
    throw new ValidationError(`Kategori tidak dapat dihapus karena masih digunakan oleh ${existing._count.news} berita aktif`);
  }

  await prisma.newsCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  return ApiResponse.deleted("Kategori berita berhasil dihapus");
});
