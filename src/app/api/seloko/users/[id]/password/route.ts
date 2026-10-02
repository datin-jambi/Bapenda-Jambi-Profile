import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { changePasswordSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError, BadRequestError } from "@/lib/errors";
import bcrypt from "bcryptjs";

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  if (user.id !== id) throw new ForbiddenError();

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const fullUser = await userRepository.findByEmail(user.email);
  if (!fullUser) throw new NotFoundError("User tidak ditemukan");

  const valid = await bcrypt.compare(parsed.data.currentPassword, fullUser.passwordHash);
  if (!valid) throw new BadRequestError("Password saat ini salah");

  await userRepository.updatePassword(id, parsed.data.newPassword);
  return ApiResponse.updated(null, "Password berhasil diubah");
});
