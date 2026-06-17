import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken, signRefreshToken, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return ApiResponse.error("Refresh token tidak ditemukan", 401);
    }

    const refreshPayload = await verifyRefreshToken(refreshToken);

    if (!refreshPayload?.sub) {
      return ApiResponse.error("Refresh token tidak valid", 401);
    }

    const userId = Number(refreshPayload.sub);
    if (isNaN(userId)) {
      return ApiResponse.error("Refresh token tidak valid", 401);
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, role: true, name: true, uptdId: true, isActive: true },
    });

    if (!user) {
      console.warn(`[auth/refresh] User not found: id=${userId}`);
      return ApiResponse.error("User tidak ditemukan", 401);
    }

    if (!user.isActive) {
      console.warn(`[auth/refresh] Inactive user attempted refresh: id=${userId}`);
      return ApiResponse.error("Akun tidak aktif", 403);
    }

    const newAccessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      uptdId: user.uptdId,
    });
    const newRefreshToken = await signRefreshToken(user.id);

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken: newAccessToken },
    });

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[auth/refresh] Unexpected error:", err instanceof Error ? err.message : "unknown");
    return ApiResponse.error("Internal server error", 500);
  }
}

// GET tetap untuk redirect flow dari middleware
export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect") ?? "/cms/dashboard";
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload?.sub) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const userId = Number(refreshPayload.sub);
  if (isNaN(userId)) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, role: true, name: true, uptdId: true, isActive: true },
  });

  if (!user || !user.isActive) {
    console.warn(`[auth/refresh/GET] User invalid or inactive: id=${userId}`);
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const newAccessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    uptdId: user.uptdId,
  });
  const newRefreshToken = await signRefreshToken(user.id);

  const safeRedirect = redirect.startsWith("/") ? redirect : "/cms/dashboard";
  const response = NextResponse.redirect(new URL(safeRedirect, request.url));

  response.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });
  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });

  return response;
}

