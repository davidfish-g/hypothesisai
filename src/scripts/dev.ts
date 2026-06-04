const server = Bun.spawn(["bun", "--hot", "src/server/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
  env: {
    ...process.env,
    PORT: process.env.API_PORT || "3001",
  },
});

const client = Bun.spawn(["bun", "x", "vite", "--host", "0.0.0.0"], {
  stdout: "inherit",
  stderr: "inherit",
  env: process.env,
});

function shutdown() {
  server.kill();
  client.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const [serverExit, clientExit] = await Promise.race([
  server.exited.then((code) => ["server", code] as const),
  client.exited.then((code) => ["client", code] as const),
]);

shutdown();
console.log(`${serverExit} exited with code ${clientExit}`);
process.exit(clientExit ?? 0);

export {};
