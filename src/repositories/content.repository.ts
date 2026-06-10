import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const faqRepository = {
  async findAll(params: {
    skip: number; limit: number;
    categoryId?: number; isPublished?: boolean; search?: string;
  }) {
    const where = {
      deletedAt: null,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
      ...(params.search && {
        OR: [
          { question: { contains: params.search, mode: "insensitive" as const } },
          { answer: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.faq.findMany({
        where, skip: params.skip, take: params.limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.faq.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.faq.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
  },

  async findPublished(params: { search?: string; categoryId?: number }) {
    const where = {
      deletedAt: null,
      isPublished: true,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.search && {
        OR: [
          { question: { contains: params.search, mode: "insensitive" as const } },
          { answer: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    return prisma.faq.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  },

  async findMostViewed(limit = 5) {
    return prisma.faq.findMany({
      where: { deletedAt: null, isPublished: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { viewCount: "desc" },
      take: limit,
    });
  },

  async incrementViewCount(id: number) {
    return prisma.faq.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  },

  async generateSlug(question: string): Promise<string> {
    const base = slugify(question);
    let slug = base;
    let i = 1;
    while (await prisma.faq.findFirst({ where: { slug, deletedAt: null } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  },

  async create(data: {
    categoryId: number; authorId: number; question: string;
    answer: string; sortOrder?: number; isPublished?: boolean;
  }) {
    const slug = await faqRepository.generateSlug(data.question);
    return prisma.faq.create({
      data: {
        ...data,
        slug,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  },

  async update(id: number, updatedById: number, data: Partial<{
    categoryId: number; question: string; answer: string;
    sortOrder: number; isPublished: boolean;
  }>) {
    const current = await prisma.faq.findUnique({ where: { id } });
    const wasPublished = current?.isPublished ?? false;
    const isPublishing = data.isPublished === true && !wasPublished;

    return prisma.faq.update({
      where: { id },
      data: {
        ...data,
        updatedById,
        ...(isPublishing && { publishedAt: new Date() }),
        ...(data.isPublished === false && { publishedAt: null }),
      },
    });
  },

  async delete(id: number) {
    return prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const pageRepository = {
  async findAll() {
    return prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  },

  async findPaginated(params: {
    skip: number; limit: number; search?: string; isPublished?: boolean;
  }) {
    const where = {
      deletedAt: null,
      ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.page.findMany({
        where, skip: params.skip, take: params.limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.page.count({ where }),
    ]);
    return { data, total };
  },

  async findBySlug(slug: string) {
    return prisma.page.findUnique({ where: { slug, deletedAt: null } });
  },

  async findById(id: number) {
    return prisma.page.findUnique({ where: { id, deletedAt: null } });
  },

  async generateSlug(base: string, excludeId?: number): Promise<string> {
    const baseSlug = slugify(base);
    let slug = baseSlug;
    let i = 1;
    while (
      await prisma.page.findFirst({
        where: { slug, deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
      })
    ) {
      slug = `${baseSlug}-${i++}`;
    }
    return slug;
  },

  async create(data: {
    title: string; slug?: string; content: string;
    seoTitle?: string | null; seoDescription?: string | null; isPublished?: boolean;
  }) {
    const slug = data.slug || await pageRepository.generateSlug(data.title);
    return prisma.page.create({ data: { ...data, slug } });
  },

  async update(id: number, data: Partial<{
    title: string; slug: string; content: string;
    seoTitle: string | null; seoDescription: string | null; isPublished: boolean;
  }>) {
    return prisma.page.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.page.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const bannerRepository = {
  async findAll(params: { skip: number; limit: number; search?: string; isActive?: boolean }) {
    const where = {
      deletedAt: null,
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && { title: { contains: params.search, mode: "insensitive" as const } }),
    };
    const [data, total] = await Promise.all([
      prisma.banner.findMany({
        where, skip: params.skip, take: params.limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.banner.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.banner.findUnique({ where: { id, deletedAt: null } });
  },

  async create(data: {
    title: string; description?: string | null; imageUrl: string;
    buttonText?: string | null; buttonUrl?: string | null;
    sortOrder?: number; isActive?: boolean;
  }) {
    return prisma.banner.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; description: string | null; imageUrl: string;
    buttonText: string | null; buttonUrl: string | null;
    sortOrder: number; isActive: boolean;
  }>) {
    return prisma.banner.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.banner.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const regulationRepository = {
  async findAll(params: {
    skip: number; limit: number; search?: string; status?: string;
  }) {
    const where = {
      deletedAt: null,
      ...(params.search && { title: { contains: params.search, mode: "insensitive" as const } }),
      ...(params.status && params.status !== "all" && { status: params.status as import("@prisma/client").ContentStatus }),
    };
    const [data, total] = await Promise.all([
      prisma.regulation.findMany({
        where, skip: params.skip, take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.regulation.count({ where }),
    ]);
    return { data, total };
  },

  async findPublished(params: { skip: number; limit: number; search?: string }) {
    const where = {
      deletedAt: null,
      status: "PUBLISHED" as import("@prisma/client").ContentStatus,
      ...(params.search && { title: { contains: params.search, mode: "insensitive" as const } }),
    };
    const [data, total] = await Promise.all([
      prisma.regulation.findMany({
        where, skip: params.skip, take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.regulation.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.regulation.findUnique({ where: { id, deletedAt: null } });
  },

  async findBySlug(slug: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma.regulation as any).findUnique({ where: { slug, deletedAt: null } });
  },

  async create(data: {
    title: string; slug: string; description?: string | null;
    fileUrl: string; fileId?: string | null; fileName?: string | null;
    status?: import("@prisma/client").ContentStatus; publishedAt?: Date | null;
  }) {
    return prisma.regulation.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; slug: string; description: string | null;
    fileUrl: string; fileId: string | null; fileName: string | null;
    status: import("@prisma/client").ContentStatus; publishedAt: Date | null;
  }>) {
    return prisma.regulation.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.regulation.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const settingRepository = {
  async findAll() {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  },

  async upsert(key: string, value: string) {
    return prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async upsertMany(data: Record<string, string>) {
    return Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
  },
};

export const uptdRepository = {
  async findAll(params?: { activeOnly?: boolean }) {
    return prisma.uptd.findMany({
      where: { deletedAt: null, ...(params?.activeOnly && { isActive: true }) },
      orderBy: { code: "asc" },
    });
  },

  async findPaginated(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    isActive?: boolean;
    hasUsers?: boolean;
  }) {
    const where = {
      deletedAt: null,
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { code: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
      ...(params.hasUsers === true && { users: { some: { deletedAt: null } } }),
      ...(params.hasUsers === false && { users: { none: { deletedAt: null } } }),
    };

    const [data, total] = await Promise.all([
      prisma.uptd.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { code: "asc" },
        include: { _count: { select: { users: { where: { deletedAt: null } } } } },
      }),
      prisma.uptd.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: number) {
    return prisma.uptd.findUnique({
      where: { id, deletedAt: null },
      include: { _count: { select: { users: { where: { deletedAt: null } } } } },
    });
  },

  async findByIdWithStats(id: number) {
    const uptd = await prisma.uptd.findUnique({
      where: { id, deletedAt: null },
    });
    if (!uptd) return null;

    const [userStats, users] = await Promise.all([
      prisma.user.groupBy({
        by: ["role", "isActive"],
        where: { uptdId: id, deletedAt: null },
        _count: { id: true },
      }),
      prisma.user.findMany({
        where: { uptdId: id, deletedAt: null },
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, createdAt: true, avatarUrl: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalUser = userStats.reduce((sum, s) => sum + s._count.id, 0);
    const totalAdmin = userStats
      .filter((s) => s.role === "Admin" || s.role === "Ketua_Uptd" || s.role === "Admin_Uptd")
      .reduce((sum, s) => sum + s._count.id, 0);
    const totalOperator = userStats
      .filter((s) => s.role === "Editor")
      .reduce((sum, s) => sum + s._count.id, 0);
    const totalAktif = userStats
      .filter((s) => s.isActive)
      .reduce((sum, s) => sum + s._count.id, 0);
    const totalNonaktif = userStats
      .filter((s) => !s.isActive)
      .reduce((sum, s) => sum + s._count.id, 0);

    return {
      ...uptd,
      stats: { totalUser, totalAdmin, totalOperator, totalAktif, totalNonaktif },
      users,
    };
  },

  async create(data: {
    code: string; name: string; description?: string | null;
    address?: string | null; phone?: string | null; email?: string | null;
    headName?: string | null; isActive?: boolean; showOnPublicMap?: boolean;
    province?: string | null; city?: string | null; district?: string | null;
    subDistrict?: string | null; postalCode?: string | null;
    latitude?: number | null; longitude?: number | null; googleMapsUrl?: string | null;
  }) {
    return prisma.uptd.create({ data });
  },

  async update(id: number, data: Partial<{
    code: string; name: string; description: string | null;
    address: string | null; phone: string | null; email: string | null;
    headName: string | null; isActive: boolean; showOnPublicMap: boolean;
    province: string | null; city: string | null; district: string | null;
    subDistrict: string | null; postalCode: string | null;
    latitude: number | null; longitude: number | null; googleMapsUrl: string | null;
  }>) {
    return prisma.uptd.update({ where: { id }, data });
  },

  async findForPublicMap(params: { search?: string; city?: string; district?: string }) {
    return prisma.uptd.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        showOnPublicMap: true,
        latitude: { not: null },
        longitude: { not: null },
        ...(params.search && {
          name: { contains: params.search, mode: "insensitive" as const },
        }),
        ...(params.city && { city: { contains: params.city, mode: "insensitive" as const } }),
        ...(params.district && { district: { contains: params.district, mode: "insensitive" as const } }),
      },
      select: {
        id: true, code: true, name: true, description: true,
        address: true, phone: true, email: true,
        city: true, district: true, province: true,
        latitude: true, longitude: true, googleMapsUrl: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async delete(id: number) {
    return prisma.uptd.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
