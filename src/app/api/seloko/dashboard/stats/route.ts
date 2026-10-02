import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError } from "@/lib/errors";
import { ContentStatus } from "@prisma/client";

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const isAdminOrSuper = user.role === "Super_Admin" || user.role === "Admin";
  const isEditor = user.role === "Editor" || user.role === "Admin_Uptd" || user.role === "Ketua_Uptd";

  // Filter by authorId for non-admin roles
  const authorFilter = isEditor ? { authorId: user.id } : {};

  // --- Stat counts ---
  const [newsTotal, galleryTotal, faqTotal] = await Promise.all([
    prisma.news.count({ where: { deletedAt: null, ...authorFilter } }),
    prisma.gallery.count({ where: { deletedAt: null, ...authorFilter } }),
    prisma.faq.count({ where: { deletedAt: null } }),
  ]);

  // --- News by status ---
  const newsByStatus = await prisma.news.groupBy({
    by: ["status"],
    where: { deletedAt: null, ...authorFilter },
    _count: { _all: true },
  });

  // --- Gallery by status ---
  const galleryByStatus = await prisma.gallery.groupBy({
    by: ["status"],
    where: { deletedAt: null, ...authorFilter },
    _count: { _all: true },
  });

  // --- News per month (last 6 months) ---
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentNews = await prisma.news.findMany({
    where: { deletedAt: null, createdAt: { gte: sixMonthsAgo }, ...authorFilter },
    select: { createdAt: true },
  });

  const monthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = 0;
  }
  for (const n of recentNews) {
    const d = new Date(n.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthMap) monthMap[key]++;
  }
  const newsPerMonth = Object.entries(monthMap).map(([month, count]) => ({
    month,
    count,
  }));

  // --- Admin/Super only: users by role ---
  let usersByRole = null;
  if (isAdminOrSuper) {
    const rows = await prisma.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    usersByRole = rows.map((r) => ({ role: r.role, count: r._count._all }));
  }

  // --- Admin/Super only: news by category ---
  let newsByCategory = null;
  if (isAdminOrSuper) {
    const rows = await prisma.news.groupBy({
      by: ["categoryId"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    const categories = await prisma.newsCategory.findMany({
      where: { id: { in: rows.map((r) => r.categoryId) } },
      select: { id: true, name: true },
    });
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    newsByCategory = rows.map((r) => ({
      category: catMap[r.categoryId] ?? "Unknown",
      count: r._count._all,
    }));
  }

  // --- Admin/Super only: recent audit logs ---
  let recentActivity = null;
  if (isAdminOrSuper) {
    recentActivity = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
  }

  // --- FAQ top viewed ---
  const topFaqs = await prisma.faq.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { id: true, question: true, viewCount: true },
  });

  // --- Published vs draft counts ---
  const publishedNews = newsByStatus.find((s) => s.status === ContentStatus.PUBLISHED)?._count._all ?? 0;
  const pendingNews = newsByStatus.find((s) => s.status === ContentStatus.PENDING_REVIEW)?._count._all ?? 0;

  return ApiResponse.success({
    counts: { news: newsTotal, gallery: galleryTotal, faq: faqTotal },
    newsByStatus: newsByStatus.map((s) => ({ status: s.status, count: s._count._all })),
    galleryByStatus: galleryByStatus.map((s) => ({ status: s.status, count: s._count._all })),
    newsPerMonth,
    publishedNews,
    pendingNews,
    usersByRole,
    newsByCategory,
    recentActivity,
    topFaqs,
  });
});
