import { NextRequest } from "next/server";
import { getImageKitAuthParams } from "@/lib/imagekit";
import { ApiResponse } from "@/lib/api-response";
import { getAuthUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError } from "@/lib/errors";

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const params = await getImageKitAuthParams();
  return ApiResponse.success(params);
});
