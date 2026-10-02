import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth";

const SELOKO_PATH = "/seloko";
const AUTH_PATHS = ["/seloko/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isSelokoPath = pathname.startsWith(SELOKO_PATH);
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isApiPath = pathname.startsWith("/api/");

  if (!isSelokoPath && !isApiPath) return NextResponse.next();

  // Allow public API routes
  if (isApiPath && !pathname.startsWith("/api/seloko")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Try access token
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      if (isAuthPath) {
        return NextResponse.redirect(new URL("/seloko/dashboard", request.url));
      }
      const response = NextResponse.next();
      response.headers.set("x-user-id", String(payload.sub));
      response.headers.set("x-user-role", payload.role);
      return response;
    }
  }

  // Access token invalid/expired — jika ada refresh token, arahkan ke API refresh
  // Refresh token handling dilakukan di /api/auth/refresh (Node.js runtime, bukan Edge)
  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      // Redirect ke API refresh yang akan set cookie baru lalu redirect ke tujuan
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }
  }

  // Not authenticated
  if (isAuthPath) return NextResponse.next();

  if (isSelokoPath) {
    return NextResponse.redirect(new URL("/seloko/login", request.url));
  }

  if (isApiPath) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seloko/:path*", "/api/seloko/:path*"],
};
