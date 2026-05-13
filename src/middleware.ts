import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protect all routes except public ones
const isPublicRoute = createRouteMatcher([
  "/",
  "/upload(.*)",
  "/api/weather(.*)",
  "/shop(.*)",           // Shop browsing is public (affiliate links)
  "/demo(.*)",           // Public demo page (SEO content)
  "/blog(.*)",           // Public blog (SEO content)
  "/resources(.*)",      // Public style guides (SEO link magnet)
  "/privacy(.*)",        // Legal page
  "/terms(.*)",          // Legal page
  "/delete-account(.*)", // Delete account page
  "/admin(.*)",           // Admin dashboard
  "/onboarding(.*)",     // Onboarding wizard
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // ─── New-user onboarding redirect ──────────────────────────
  // Redirect authenticated new users (no items, no style prefs) to /onboarding.
  // Only check for authenticated requests to non-API, non-static, non-onboarding routes.
  const { userId } = await auth();
  if (
    userId &&
    !isPublicRoute(request) &&
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/onboarding") &&
    !request.nextUrl.pathname.startsWith("/_next")
  ) {
    // Fetch profile to determine if user needs onboarding
    const origin = request.nextUrl.origin;
    try {
      const res = await fetch(`${origin}/api/profile`, {
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        const hasItems = (profile?.itemCount || 0) > 0;
        const hasStylePrefs =
          profile?.stylePreferences?.preferredStyle &&
          profile.stylePreferences.preferredStyle !== "casual";
        const hasBodyInfo = profile?.bodyType || profile?.skinTone || profile?.heightCm;

        if (!hasItems && !hasStylePrefs && !hasBodyInfo) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    } catch {
      // If profile fetch fails, let the request through normally
    }
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",],
};
