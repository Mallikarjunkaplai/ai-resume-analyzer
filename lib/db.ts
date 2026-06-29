/**
 * lib/db.ts — Prisma Client Singleton
 *
 * Problem this solves:
 *   Next.js hot-reloading (HMR) re-executes module-level code on every file
 *   save during development. Without this pattern, each reload would create a
 *   new PrismaClient instance, quickly exhausting the PostgreSQL connection
 *   pool (Neon has a hard cap per project on the free tier).
 *
 * Solution:
 *   We store the PrismaClient on the Node.js `global` object, which persists
 *   across HMR reloads. In production, module-level singletons are safe
 *   because the module cache is never invalidated.
 *
 * Prisma 7 breaking change — driver adapters:
 *   PrismaClient no longer accepts `datasourceUrl` or `datasources` options.
 *   Instead it requires EITHER:
 *     • `adapter` — a driver adapter factory (e.g. PrismaNeon, PrismaPg)
 *     • `accelerateUrl` — a Prisma Accelerate connection URL
 *
 *   We use `@prisma/adapter-neon` with the Neon WebSocket pool so the app
 *   benefits from Neon's connection pooler at runtime.
 *   The unpooled URL (DATABASE_URL_UNPOOLED) is only used by the Prisma CLI
 *   for migrations (see prisma.config.ts).
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// ---------------------------------------------------------------------------
// Extend the Node.js global type to hold our cached PrismaClient instance.
// This keeps TypeScript happy without using `any`.
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Use a dummy connection string during Vercel's build/static-generation phase
  // when DATABASE_URL is not yet available. The dummy string prevents PrismaNeon
  // from throwing at import time — actual DB connections only happen at request time.
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://dummy:dummy@dummy.neon.tech/dummy?sslmode=require";

  // Prisma 7: pass a driver adapter — NOT datasourceUrl or datasources.
  // PrismaNeon uses Neon's WebSocket pool, which works in serverless runtimes.
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // log SQL in dev for observability
        : ["error"],                 // only errors in production
  });
}

// ---------------------------------------------------------------------------
// In development: reuse the instance stored on `global` across HMR reloads.
// In production:  always create a fresh instance (no HMR, no problem).
// ---------------------------------------------------------------------------
const db = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  // Cache the instance so subsequent HMR reloads reuse the same connection pool.
  global.prisma = db;
}

export { db };
