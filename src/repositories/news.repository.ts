import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";

export const newsRepository = {
  async findAll(params: {
    skip: number; limit: number; page: number;
    status?: ContentStatus; categoryId?: number;
    authorId?: number; search?: string;
  }) {
    const where = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.authorId && { authorId: params.authorId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { excerpt: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.news.findMany({
        where, skip: params.skip, take: params.limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, thumbnailUrl: true,
          status: true, publishedAt: true, createdAt: true, updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.news.count({ where }),
    ]);
    return { data, total };
  },

  async findBySlug(slug: string) {
    return prisma.news.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },

  async findById(id: number) {
    return prisma.news.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },

  async create(data: {
    title: string; slug: string; categoryId: number; authorId: number;
    excerpt?: string | null; content: string; thumbnailUrl?: string | null;
    status: ContentStatus; publishedAt?: Date | null;
    seoTitle?: string | null; seoDescription?: string | null;
  }) {
    return prisma.news.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; slug: string; categoryId: number; excerpt: string | null;
    content: string; thumbnailUrl: string | null; status: ContentStatus;
    publishedAt: Date | null; seoTitle: string | null; seoDescription: string | null;
  }>) {
    return prisma.news.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.news.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async findPublished(params: { skip: number; limit: number; categoryId?: number; search?: string }) {
    const where = {
      deletedAt: null,
      status: ContentStatus.PUBLISHED,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { excerpt: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.news.findMany({
        where, skip: params.skip, take: params.limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, thumbnailUrl: true,
          status: true, publishedAt: true, createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.news.count({ where }),
    ]);
    return { data, total };
  },
};
