import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Routes that require a signed-in user. Everything else is public.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/account(.*)",
  "/profile(.*)",
])

// Clerk-hosted auth screens live at these paths. Signed-in users get bounced away.
const isAuthRoute = createRouteMatcher(["/login(.*)", "/signup(.*)"])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  if (isAuthRoute(request) && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isProtectedRoute(request) && !userId) {
    const signInUrl = new URL("/login", request.url)
    signInUrl.searchParams.set(
      "redirect_url",
      request.nextUrl.pathname + request.nextUrl.search
    )
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
