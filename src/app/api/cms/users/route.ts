import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { registerSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { Role } from "@prisma/client";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "Super_Admin" && user.role !== "Admin") throw new ForbiddenError("Hanya Super Admin atau Admin yang dapat mengakses fitur ini");

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const role = searchParams.get("role") as Role | null;
  const search = searchParams.get("search") || undefined;

  const { data, total } = await userRepository.findAll({ page, limit, skip, role: role || undefined, search });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "Super_Admin") throw new ForbiddenError();

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const existing = await userRepository.findByEmail(parsed.data.email);
  if (existing) throw new ConflictError("Email sudah terdaftar");

  const created = await userRepository.create({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    role: parsed.data.role,
    uptdId: parsed.data.uptdId,
    phone: parsed.data.phone,
    gender: parsed.data.gender,
    isActive: parsed.data.isActive ?? true,
  });

  await createAuditLog({ userId: user.id, action: "CREATE_USER", entityType: "User", entityId: created.id });
  return ApiResponse.created(
    { id: created.id, email: created.email, name: created.name, role: created.role },
    "User berhasil dibuat"
  );
});
