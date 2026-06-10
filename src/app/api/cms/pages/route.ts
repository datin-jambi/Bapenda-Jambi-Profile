import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { pageRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError } from "@/lib/errors";

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const pages = await pageRepository.findAll();
  return ApiResponse.success(pages);
});
