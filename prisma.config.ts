/**
 * prisma.config.ts — Prisma 7 Configuration File
 *
 * ⚠️  Prisma 7 Breaking Change:
 *     Connection URLs are no longer declared inside `schema.prisma`.
 *     They must now be defined here in `prisma.config.ts` for the CLI to use
 *     (for `prisma migrate dev`, `prisma db push`, `prisma generate`, etc.)
 *
 * Two bugs we work around here:
 *
 *   1. `dotenv/config` loads `.env` by default — Next.js uses `.env.local`.
 *      We must explicitly point dotenv at `.env.local` using dotenv.config().
 *
 *   2. Prisma's `env()` helper throws `PrismaConfigEnvError` if the variable
 *      is not found at the time the helper is called (before dotenv runs).
 *      We use `process.env` directly — it is always safe after dotenv.config().
 *
 * Environment variables (in .env.local):
 *   DATABASE_URL          — Pooled Neon connection string (runtime).
 *   DATABASE_URL_UNPOOLED — Direct Neon connection string (migrations/CLI).
 */

import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Explicitly load .env.local — dotenv defaults to .env which does not exist.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use the direct (non-pooled) URL for the CLI so DDL migrations work.
    // Falls back to DATABASE_URL if DATABASE_URL_UNPOOLED is not set.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
