import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JwtPayload, AuthUser } from "@/types";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-min-32-chars-long!!"
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-min-32-chars!!"
);

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// ─── Token Generation ─────────────────────────────────────────────────────────

export async function generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload, sub: String(payload.sub) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(sub: number): Promise<string> {
  return new SignJWT({ sub: String(sub) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_REFRESH_SECRET);
}

// ─── Aliases for backward compatibility ──────────────────────────────────────

export const signAccessToken = generateAccessToken;
export const signRefreshToken = generateRefreshToken;

// ─── Token Verification ───────────────────────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    if (!payload.sub) return null;
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}

// ─── Cookie Management ────────────────────────────────────────────────────────

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });
  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

// ─── Auth User ────────────────────────────────────────────────────────────────

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    if (!payload) return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
      name: payload.name,
      uptdId: payload.uptdId,
    };
  } catch {
    return null;
  }
}

