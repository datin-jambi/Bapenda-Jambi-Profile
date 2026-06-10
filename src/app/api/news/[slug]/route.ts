import { NextRequest } from "next/server";
import { newsRepository } from "@/repositories/news.repository";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const news = await newsRepository.findBySlug(slug);
  if (!news) return errorResponse("Berita tidak ditemukan", 404);
  if (news.status !== "PUBLISHED") return errorResponse("Berita tidak ditemukan", 404);
  return successResponse(news);
}
