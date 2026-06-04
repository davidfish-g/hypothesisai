import { getCookie, setCookie } from "hono/cookie";
import type { Context, MiddlewareHandler } from "hono";
import { jwtVerify, SignJWT } from "jose";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  expertise?: string[];
  scholarId?: string | null;
};

export type SessionPayload = {
  user: SessionUser;
};

export const sessionCookieName = "hypothesisai_session";

const encoder = new TextEncoder();

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }
  return encoder.encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(sessionSecret());
}

export async function readSession(c: Context): Promise<SessionPayload | null> {
  const token = getCookie(c, sessionCookieName);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const user = payload.user as SessionUser | undefined;
    return user?.id ? { user } : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(c: Context, user: SessionUser) {
  const token = await createSessionToken(user);
  setCookie(c, sessionCookieName, token, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(c: Context) {
  setCookie(c, sessionCookieName, "", {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await readSession(c);
  if (!session?.user?.email) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  await next();
};

declare module "hono" {
  interface ContextVariableMap {
    session: SessionPayload;
  }
}
