import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { updateUserSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError, BadRequestError } from "@/lib/errors";

const canManageUser = (actor: { role: string; id: number }, targetId: number) =>
  actor.role === "Super_Admin" || actor.role === "Admin" || actor.id === targetId;

export const GET = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  if (!canManageUser(user, id)) throw new ForbiddenError();

  const found = await userRepository.findById(id);
  if (!found) throw new NotFoundError("User tidak ditemukan");
  return ApiResponse.success(found);
});

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const { id } = await resolveParams(ctx);
  if (!canManageUser(user, id)) throw new ForbiddenError();

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  if (parsed.data.role && user.role !== "Super_Admin" && user.role !== "Admin") {
    delete parsed.data.role;
  }

  const updated = await userRepository.update(id, parsed.data);
  await createAuditLog({ userId: user.id, action: "UPDATE_USER", entityType: "User", entityId: id });
  return ApiResponse.updated({ id: updated.id, name: updated.name, email: updated.email, role: updated.role }, "User berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "Super_Admin") throw new ForbiddenError();
  const { id } = await resolveParams(ctx);
  if (user.id === id) throw new BadRequestError("Tidak dapat menghapus akun sendiri");

  await userRepository.delete(id);
  await createAuditLog({ userId: user.id, action: "DELETE_USER", entityType: "User", entityId: id });
  return ApiResponse.deleted("User berhasil dihapus");
});
