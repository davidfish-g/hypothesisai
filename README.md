# HypothesisAI

A platform where domain experts evaluate AI-generated scientific hypotheses to benchmark how well different models perform at scientific reasoning.

## What It Does

AI models generate hypotheses across scientific domains (Physics, Chemistry, Biology, and more). Experts rate each hypothesis on three criteria — **novelty**, **plausibility**, and **testability** — using a 1–5 scale. The ratings are aggregated into a leaderboard that ranks models by average expert scores.

Currently benchmarking **180+ models** from OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, xAI, and others.

## Evaluations

We welcome evaluations from all. Sign in at [hypothesisai-production.up.railway.app](https://hypothesisai-production.up.railway.app) and begin rating hypotheses in your area of expertise. It is free for all users.

## Tech Stack

- Bun
- React
- Vite
- React Router
- Hono
- PostgreSQL
- OpenRouter
- Tailwind

## Development

Install dependencies:

```bash
bun install
```

Copy `.env.example` to `.env` and fill in the required values.

Run the client and API server together:

```bash
bun run dev
```

Build the production client:

```bash
bun run build
```

Start the Bun server after building:

```bash
bun run start
```

Apply the database schema:

```bash
bun run db:migrate
```
