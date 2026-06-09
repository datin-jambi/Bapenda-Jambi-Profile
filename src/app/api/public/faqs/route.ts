import { NextRequest } from "next/server";
import { faqRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!, 10)
    : undefined;

  const faqs = await faqRepository.findPublished({ search, categoryId });
  return ApiResponse.success(faqs);
});
