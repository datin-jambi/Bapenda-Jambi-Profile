import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";

export const galleryRepository = {
  async findAll(params: { skip: number; limit: number; status?: ContentStatus; authorId?: number; search?: string }) {
    const where = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.authorId && { authorId: params.authorId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { description: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.gallery.findMany({
        where, skip: params.skip, take: params.limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.gallery.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.gallery.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        items: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      },
    });
  },

  async create(data: {
    authorId: number; title: string; description?: string | null;
    coverImage?: string | null; status?: ContentStatus;
  }) {
    return prisma.gallery.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; description: string | null; coverImage: string | null;
    status: ContentStatus;
  }>) {
    return prisma.gallery.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.gallery.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async addItem(galleryId: number, data: {
    mediaType: "IMAGE" | "VIDEO" | "PDF"; fileUrl: string; fileId?: string | null;
    title?: string | null; description?: string | null; sortOrder?: number;
  }) {
    return prisma.galleryItem.create({ data: { galleryId, ...data } });
  },

  async deleteItem(itemId: number) {
    return prisma.galleryItem.update({ where: { id: itemId }, data: { deletedAt: new Date() } });
  },
};
