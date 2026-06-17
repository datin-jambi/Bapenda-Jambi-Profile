import { NextRequest } from "next/server";
import { regulationRepository } from "@/repositories/content.repository";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;

  const { data, total } = await regulationRepository.findPublished({ skip, limit, search });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});
