import { NextRequest } from "next/server";
import { galleryRepository } from "@/repositories/gallery.repository";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;

  const { data, total } = await galleryRepository.findAll({
    skip,
    limit,
    status: "PUBLISHED",
    search,
  });

  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});
