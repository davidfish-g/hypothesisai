import { Hono } from "hono";
import { query } from "@/lib/db";
import { requireAuth } from "@/server/auth/session";

export const evaluationsRoutes = new Hono();

evaluationsRoutes.use("*", requireAuth);

evaluationsRoutes.post("/", async (c) => {
  const session = c.get("session");

  try {
    const { hypothesisId, plausibility, novelty, testability, comments } = await c.req.json();

    if (!hypothesisId || !plausibility || !novelty || !testability) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const users = await query(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (!users[0]) {
      return c.json({ error: "User not found" }, 404);
    }
    const userId = users[0].id as string;

    const rows = await query(
      `INSERT INTO evaluations (id, "hypothesisId", "userId", plausibility, novelty, testability, comments, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT ("hypothesisId", "userId")
       DO UPDATE SET plausibility = EXCLUDED.plausibility, novelty = EXCLUDED.novelty, testability = EXCLUDED.testability, comments = EXCLUDED.comments, "updatedAt" = NOW()
       RETURNING *`,
      [hypothesisId, userId, plausibility, novelty, testability, comments ?? null]
    );

    return c.json(rows[0]);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return c.json({ error: "Failed to create evaluation" }, 500);
  }
});

evaluationsRoutes.get("/", async (c) => {
  const session = c.get("session");

  try {
    const users = await query(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (!users[0]) {
      return c.json({ error: "User not found" }, 404);
    }
    const userId = users[0].id as string;

    const evaluations = await query(
      `SELECT e.*,
        json_build_object('id', h.id, 'content', h.content, 'modelName', h."modelName", 'domain', h.domain, 'createdAt', h."createdAt") as hypothesis,
        json_build_object('id', u.id, 'name', u.name, 'expertise', u.expertise) as user
      FROM evaluations e
      JOIN hypotheses h ON e."hypothesisId" = h.id
      JOIN users u ON e."userId" = u.id
      WHERE e."userId" = $1
      ORDER BY e."createdAt" DESC`,
      [userId]
    );

    return c.json(evaluations);
  } catch (error) {
    console.error("Failed to fetch evaluations:", error);
    return c.json({ error: "Failed to fetch evaluations" }, 500);
  }
});
