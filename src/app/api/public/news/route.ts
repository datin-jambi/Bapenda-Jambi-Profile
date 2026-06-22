import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 20);

  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      thumbnailUrl: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });
  return ApiResponse.success(news);
});
