import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { accountRoutes } from "@/server/routes/account";
import { authRoutes, sessionRoutes } from "@/server/routes/auth";
import { evaluationsRoutes } from "@/server/routes/evaluations";
import { generateRoutes } from "@/server/routes/generate";
import { hypothesesRoutes } from "@/server/routes/hypotheses";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/api", sessionRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/evaluations", evaluationsRoutes);
app.route("/api/generate", generateRoutes);
app.route("/api/hypotheses", hypothesesRoutes);

app.get("/api/health", (c) => c.json({ ok: true }));

app.use("/assets/*", serveStatic({ root: "./dist" }));
app.use("/logo.png", serveStatic({ root: "./dist" }));
app.use("/favicon.ico", serveStatic({ root: "./dist" }));

app.get("*", async () => {
  const index = Bun.file("./dist/index.html");
  if (!(await index.exists())) {
    return new Response(
      "Client build not found. Run `bun run build` before `bun run start`, or use `bun run dev` during development.",
      { status: 404, headers: { "content-type": "text/plain" } }
    );
  }

  return new Response(index, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});

if (import.meta.main) {
  const port = Number(process.env.PORT || 3000);

  Bun.serve({
    port,
    fetch: app.fetch,
  });

  console.log(`HypothesisAI server listening on http://localhost:${port}`);
}

export default app;
