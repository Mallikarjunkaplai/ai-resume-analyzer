/**
 * proxy.ts — Root-level Proxy (Next.js 16+)
 *
 * ⚠️  In Next.js 16 the `middleware.ts` file convention was deprecated and
 *     renamed to `proxy.ts`. This file MUST live at the project root (same
 *     level as `app/` and `package.json`).
 *
 * What this proxy does:
 *   1. Uses Clerk's `clerkMiddleware` to attach auth context to every request.
 *   2. Uses `createRouteMatcher` to declare which routes require authentication.
 *   3. Calls `auth.protect()` only for matched protected routes, leaving all
 *      other routes (including the homepage and the Svix webhook endpoint)
 *      completely public.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

/**
 * Routes that must be authenticated.
 * Add additional protected paths here as the app grows.
 *
 * Examples:
 *   '/dashboard(.*)'  — matches /dashboard and every sub-route
 *   '/settings(.*)'  — matches /settings and every sub-route
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analysis(.*)",
]);

// ---------------------------------------------------------------------------
// Proxy function (replaces the old `middleware` export)
// ---------------------------------------------------------------------------

export default clerkMiddleware(async (auth, request) => {
  // If the incoming request matches a protected route, enforce authentication.
  // Clerk will automatically redirect unauthenticated users to the sign-in page.
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // All other routes (including "/" and "/api/webhooks/(.*)") fall through
  // without any authentication check, keeping them fully public.
});

// ---------------------------------------------------------------------------
// Matcher — controls which paths the proxy function runs on at all.
//
// We deliberately exclude:
//   • _next/static  — Next.js build assets
//   • _next/image   — Image optimisation
//   • Common static file extensions
//
// We deliberately INCLUDE:
//   • /api/webhooks/(.*) — must reach the server so Svix can POST payloads.
//     The route itself is public (no auth.protect()), but it still needs the
//     proxy to run so Clerk can attach context for any future logging.
//   • /__clerk/(.*)      — Clerk's own internal routes.
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    // Run on every path EXCEPT Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for all API routes (webhooks, tRPC, etc.)
    "/(api|trpc)(.*)",
    // Always run for Clerk's internal frontend API
    "/__clerk/(.*)",
  ],
};
