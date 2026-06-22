import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async () => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, description: true, imageUrl: true, buttonText: true, buttonUrl: true },
  });
  return ApiResponse.success(banners);
});
