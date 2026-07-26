import { clerkMiddleware } from "@clerk/nextjs/server"

// Clerk v7: no createRouteMatcher in middleware.
// Auth checks (requireAuth / requireAdmin) are done per-page/layout in lib/auth.ts.
// Middleware only attaches Clerk session context to every request.
export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
