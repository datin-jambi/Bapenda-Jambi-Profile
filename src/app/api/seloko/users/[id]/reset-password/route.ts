import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
});

export const POST = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "Super_Admin" && user.role !== "Admin") throw new ForbiddenError();

  const { id } = await resolveParams(ctx);

  const target = await userRepository.findById(id);
  if (!target) throw new NotFoundError("User tidak ditemukan");

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  await userRepository.updatePassword(id, parsed.data.newPassword);
  await createAuditLog({ userId: user.id, action: "RESET_PASSWORD", entityType: "User", entityId: id });
  return ApiResponse.updated(null, "Password berhasil direset");
});
