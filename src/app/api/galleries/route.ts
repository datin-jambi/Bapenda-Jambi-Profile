import { NextRequest } from "next/server";
import { galleryRepository } from "@/repositories/gallery.repository";
import { successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "6");
  const { data } = await galleryRepository.findAll({ skip: 0, limit, status: "PUBLISHED" });
  return successResponse(data);
}
