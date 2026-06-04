import { Hono } from "hono";
import { query } from "@/lib/db";
import { clearSessionCookie, requireAuth } from "@/server/auth/session";

export const accountRoutes = new Hono();

accountRoutes.delete("/", requireAuth, async (c) => {
  const session = c.get("session");

  try {
    const users = await query(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (!users[0]) {
      return c.json({ error: "User not found" }, 404);
    }
    const userId = users[0].id as string;

    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    clearSessionCookie(c);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return c.json({ error: "Failed to delete account" }, 500);
  }
});
