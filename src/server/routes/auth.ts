import { Hono } from "hono";
import {
  clearSessionCookie,
  readSession,
  setSessionCookie,
} from "@/server/auth/session";
import { finishGoogleAuth, startGoogleAuth } from "@/server/auth/google";

export const authRoutes = new Hono();

authRoutes.get("/google", (c) => startGoogleAuth(c));

authRoutes.get("/google/callback", async (c) => {
  try {
    const result = await finishGoogleAuth(c);
    if (result.error || !result.user) {
      console.error(result.error);
      return c.redirect("/auth/signin");
    }

    await setSessionCookie(c, result.user);
    return c.redirect(result.callbackUrl || "/dashboard");
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return c.redirect("/auth/signin");
  }
});

authRoutes.post("/logout", (c) => {
  clearSessionCookie(c);
  return c.json({ success: true });
});

export const sessionRoutes = new Hono();

sessionRoutes.get("/session", async (c) => {
  const session = await readSession(c);
  return c.json(session);
});
