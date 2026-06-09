import { prisma } from "@/lib/prisma";
import { User, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const userRepository = {
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true, email: true, name: true, role: true, phone: true,
        avatarUrl: true, gender: true, isActive: true, uptdId: true,
        createdAt: true, updatedAt: true,
        uptd: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email, deletedAt: null } });
  },

  async findAll(params: { page: number; limit: number; skip: number; role?: Role; search?: string }) {
    const where = {
      deletedAt: null,
      ...(params.role && { role: params.role }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { email: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: params.skip, take: params.limit,
        select: {
          id: true, email: true, name: true, role: true, phone: true,
          avatarUrl: true, gender: true, isActive: true, uptdId: true,
          createdAt: true, updatedAt: true,
          uptd: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  },

  async create(data: {
    name: string; email: string; password: string; role: Role;
    uptdId?: number | null; phone?: string | null; gender?: string | null;
    isActive?: boolean;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        name: data.name, email: data.email, passwordHash, role: data.role,
        uptdId: data.uptdId, phone: data.phone, gender: data.gender,
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(id: number, data: Partial<Omit<User, "id" | "passwordHash" | "createdAt" | "updatedAt">>) {
    return prisma.user.update({ where: { id }, data });
  },

  async updatePassword(id: number, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async delete(id: number) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },
};
