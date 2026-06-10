import { NextRequest } from "next/server";
import { newsRepository } from "@/repositories/news.repository";
import { getPaginationParams, paginatedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!, 10)
    : undefined;
  const search = searchParams.get("search") || undefined;

  const { data, total } = await newsRepository.findPublished({ skip, limit, categoryId, search });
  return paginatedResponse(data, total, page, limit);
}
