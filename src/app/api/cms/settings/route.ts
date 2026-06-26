import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { settingRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { settingsSchema } from "@/lib/validations";

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const settings = await settingRepository.findAll();
  return ApiResponse.success(settings);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:settings")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid");
  }

  // Only allow known setting keys to be saved
  const ALLOWED_KEYS = new Set([
    "site_name", "site_description", "site_keywords", "meta_author",
    "logo_url", "favicon_url",
    "contact_address", "contact_phone", "contact_email", "contact_fax", "office_hours",
    "location_latitude", "location_longitude", "location_maps_embed_url",
    "social_facebook", "social_twitter", "social_instagram", "social_youtube", "social_tiktok",
    "google_analytics_id", "footer_text",
  ]);

  const filtered = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => ALLOWED_KEYS.has(key))
  );

  await settingRepository.upsertMany(filtered);
  return ApiResponse.updated(null, "Pengaturan berhasil disimpan");
});
