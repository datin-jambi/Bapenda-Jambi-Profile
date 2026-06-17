import { Role, ContentStatus } from "@prisma/client";

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  name: string;
  uptdId?: number | null;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  name: string;
  uptdId?: number | null;
  avatarUrl?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  uptdId?: number;
  phone?: string;
  gender?: string;
}

// News types
export interface NewsListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  status: ContentStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  category: { id: number; name: string; slug: string };
  author: { id: number; name: string };
}

// Gallery types
export interface GalleryListItem {
  id: number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  status: ContentStatus;
  createdAt: Date;
  author: { id: number; name: string };
  _count: { items: number };
}

// FAQ types
export interface FaqListItem {
  id: number;
  question: string;
  answer: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  viewCount: number;
  publishedAt: Date | null;
  category: { id: number; name: string; slug: string };
  author: { id: number; name: string };
  updatedBy: { id: number; name: string } | null;
}

// Settings
export type SiteSettings = Record<string, string>;

// Permissions
export type Permission =
  | "manage:users"
  | "manage:uptd"
  | "manage:settings"
  | "manage:banners"
  | "manage:pages"
  | "manage:regulations"
  | "approve:news"
  | "approve:gallery"
  | "manage:faq"
  | "delete:content"
  | "view:audit-logs"
  | "manage:news"
  | "create:news"
  | "edit:news"
  | "create:gallery"
  | "edit:gallery";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Super_Admin: [
    "manage:users",
    "manage:uptd",
    "manage:settings",
    "manage:banners",
    "manage:pages",
    "manage:regulations",
    "approve:news",
    "approve:gallery",
    "manage:faq",
    "manage:news",
    "delete:content",
    "view:audit-logs",
    "create:news",
    "edit:news",
    "create:gallery",
    "edit:gallery",
  ],
  Admin: [
    "approve:news",
    "approve:gallery",
    "manage:faq",
    "manage:news",
    "manage:regulations",
    "manage:pages",
    "manage:banners",
    "create:news",
    "edit:news",
    "create:gallery",
    "edit:gallery",
  ],
  Editor: ["create:news", "edit:news", "create:gallery", "edit:gallery"],
  Ketua_Uptd: ["create:news", "edit:news", "create:gallery", "edit:gallery"],
  Admin_Uptd: ["create:news", "create:gallery"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canPublish(role: Role): boolean {
  return role === "Super_Admin" || role === "Admin";
}
