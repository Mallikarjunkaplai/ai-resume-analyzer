/**
 * middleware.ts — Root-level Middleware
 *
 * What this middleware does:
 *   1. Uses Clerk's `clerkMiddleware` to attach auth context to every request.
 *   2. Explicitly passes `publishableKey` and `secretKey` to guarantee Clerk
 *      can authenticate even when env vars are read before Next.js injects them.
 *   3. Uses `createRouteMatcher` to declare which routes require authentication.
 *   4. Calls `auth.protect()` only for matched protected routes, leaving all
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
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analysis(.*)",
]);

// ---------------------------------------------------------------------------
// Proxy function
// ---------------------------------------------------------------------------

export default clerkMiddleware(
  async (auth, request) => {
    // If the incoming request matches a protected route, enforce authentication.
    // Clerk will automatically redirect unauthenticated users to the sign-in page.
    if (isProtectedRoute(request)) {
      await auth.protect();
    }

    // All other routes (including "/" and "/api/webhooks/(.*)") fall through
    // without any authentication check, keeping them fully public.
  },
  (req) => ({
    // Explicitly passing the keys via a callback prevents Clerk from failing silently or throwing
    // MIDDLEWARE_INVOCATION_FAILED when env vars aren't populated at module evaluation time on Vercel Edge.
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

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
//   • /__clerk/(.*)      — Clerk's own internal routes.
// ---------------------------------------------------------------------------

export const config = {
  // Force the middleware to run on the standard Node.js runtime instead of the
  // Vercel Edge network, which fully resolves the MIDDLEWARE_INVOCATION_FAILED error
  // caused by edge-specific env variable loading quirks.
  runtime: 'nodejs',
  matcher: [
    // Run on every path EXCEPT Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for all API routes (webhooks, tRPC, etc.)
    "/(api|trpc)(.*)",
    // Always run for Clerk's internal frontend API
    "/__clerk/(.*)",
  ],
};
