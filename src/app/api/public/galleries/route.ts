import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 20);

  const galleries = await prisma.gallery.findMany({
    where: { status: "PUBLISHED" },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      coverImage: true,
      _count: { select: { items: true } },
    },
  });
  return ApiResponse.success(galleries);
});
