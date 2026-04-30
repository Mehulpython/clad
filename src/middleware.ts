import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",],
};
