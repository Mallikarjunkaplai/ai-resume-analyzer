/**
 * app/api/webhooks/clerk/route.ts
 *
 * Clerk → Database Sync Webhook Handler
 *
 * This route receives webhook events from Clerk (via Svix) and cryptographically
 * verifies each payload before processing it. It must remain PUBLIC — no Clerk
 * auth cookie exists on an inbound Svix POST request.
 *
 * Security model:
 *   • Svix signs every payload with HMAC-SHA256 using WEBHOOK_SECRET.
 *   • The `Webhook` class from the `svix` package verifies the signature and
 *     the replay-attack timestamp in one step.
 *   • If verification fails (bad secret, tampered body, or stale timestamp)
 *     the request is rejected with 400 before any business logic runs.
 *
 * Environment variables required:
 *   WEBHOOK_SECRET  — Signing secret from Clerk Dashboard → Webhooks → your endpoint.
 *                     Starts with "whsec_". Store in .env.local, NEVER commit it.
 *   DATABASE_URL    — Neon PostgreSQL connection string (pooled).
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Route handler — POST only
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // ── 1. Validate environment ──────────────────────────────────────────────
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error(
      "[Webhook] FATAL: WEBHOOK_SECRET is not set. " +
        "Add it to .env.local as WEBHOOK_SECRET=whsec_..."
    );
    return new Response("Server misconfiguration", { status: 500 });
  }

  // ── 2. Extract Svix signature headers ───────────────────────────────────
  const headerPayload = await headers();

  const svixId        = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Reject immediately if any required Svix header is missing.
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix signature headers", { status: 400 });
  }

  // ── 3. Read raw body (must be read BEFORE verification) ─────────────────
  // Svix verifies the HMAC over the exact bytes transmitted — do NOT parse
  // the body first or the signature check will fail.
  const rawBody = await request.text();

  // ── 4. Cryptographic signature verification via Svix ────────────────────
  let event: WebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);

    // `verify` throws if the signature is invalid or the timestamp is stale
    // (replay-attack protection: Svix rejects payloads older than 5 minutes).
    event = wh.verify(rawBody, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // ── 5. Route on event type ───────────────────────────────────────────────
  const { type: eventType, data } = event;

  console.log(`[Webhook] Received event: ${eventType} | id: ${event.data.id}`);

  switch (eventType) {
    // -----------------------------------------------------------------------
    case "user.created": {
      /**
       * A new user signed up via Clerk.
       *
       * We use upsert (not create) for idempotency: Svix guarantees
       * at-least-once delivery, so this handler can fire more than once for
       * the same signup. upsert prevents duplicate rows.
       *
       *   create  → insert if no row with this Clerk ID exists
       *   update  → {} (no-op) if a row already exists, so a retried delivery
       *             cannot overwrite changes applied by a later user.updated event
       */
      const {
        id: clerkUserId,
        email_addresses,
        first_name,
        last_name,
      } = data;

      const primaryEmail =
        email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ?? null;

      console.log(
        `[Webhook] user.created — clerkId: ${clerkUserId}, email: ${primaryEmail}`
      );

      try {
        await db.user.upsert({
          where: { id: clerkUserId },
          create: {
            id:        clerkUserId,
            email:     primaryEmail ?? "",   // email is required in schema
            firstName: first_name   ?? null,
            lastName:  last_name    ?? null,
          },
          // No-op on duplicate — never overwrite with stale data.
          update: {},
        });

        console.log(`[Webhook] User upserted in DB ✓  id: ${clerkUserId}`);
      } catch (dbErr) {
        console.error("[Webhook] DB upsert failed for user.created:", dbErr);
        // Return 500 so Svix will retry on transient DB failures.
        return new Response("Database error", { status: 500 });
      }

      break;
    }

    // -----------------------------------------------------------------------
    case "user.updated": {
      /**
       * An existing user updated their profile in Clerk.
       * Sync only mutable fields — never touch `id` or `createdAt`.
       */
      const {
        id: clerkUserId,
        email_addresses,
        first_name,
        last_name,
      } = data;

      const primaryEmail =
        email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ?? null;

      console.log(`[Webhook] user.updated — clerkId: ${clerkUserId}`);

      try {
        await db.user.update({
          where: { id: clerkUserId },
          data: {
            // Pass `undefined` (not `null`) for email so Prisma skips the
            // field entirely if the primary email couldn't be resolved.
            email:     primaryEmail ?? undefined,
            firstName: first_name   ?? null,
            lastName:  last_name    ?? null,
          },
        });

        console.log(`[Webhook] User updated in DB ✓  id: ${clerkUserId}`);
      } catch (dbErr) {
        console.error("[Webhook] DB update failed for user.updated:", dbErr);
        return new Response("Database error", { status: 500 });
      }

      break;
    }

    // -----------------------------------------------------------------------
    case "user.deleted": {
      /**
       * A user was deleted from Clerk (account deletion or admin action).
       *
       * Hard-deletes the row from the database.
       * If this User has related records (resumes, analyses, etc.) ensure
       * their foreign keys use ON DELETE CASCADE in schema.prisma, or
       * explicitly delete them here before deleting the user.
       */
      if (!data.id) {
        console.warn("[Webhook] user.deleted received with no id — skipping.");
        break;
      }

      console.log(`[Webhook] user.deleted — clerkId: ${data.id}`);

      try {
        await db.user.delete({
          where: { id: data.id },
        });

        console.log(`[Webhook] User removed from DB ✓  id: ${data.id}`);
      } catch (dbErr) {
        console.error("[Webhook] DB delete failed for user.deleted:", dbErr);
        return new Response("Database error", { status: 500 });
      }

      break;
    }

    // -----------------------------------------------------------------------
    default: {
      // Log unhandled event types for observability — do not error.
      console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  }

  // ── 6. Acknowledge receipt to Svix ──────────────────────────────────────
  // A 200 tells Svix the delivery succeeded.
  // A 4xx/5xx will trigger Svix's exponential back-off retry schedule.
  return new Response(null, { status: 200 });
}
