import { app } from "@/server/app";

const port = Number(process.env.PORT || 3000);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`HypothesisAI server listening on http://localhost:${port}`);
