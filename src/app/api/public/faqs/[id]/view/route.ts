import { NextRequest } from "next/server";
import { faqRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { NotFoundError } from "@/lib/errors";

export const POST = withErrorHandler(async (request: NextRequest, ctx) => {
  const { id } = await resolveParams(ctx);
  const faq = await faqRepository.findById(id);
  if (!faq || !faq.isPublished) throw new NotFoundError("FAQ tidak ditemukan");

  await faqRepository.incrementViewCount(id);
  return ApiResponse.success({ viewCount: faq.viewCount + 1 });
});
