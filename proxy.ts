import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/sso-callback(.*)",
  "/courses",
  "/courses/(.*)",
  "/articles",
  "/articles/(.*)",
  "/stories",
  "/stories/(.*)",
  "/topics/(.*)",
  "/community",
  "/faq",
  "/contact",
  "/pricing",
  "/about",
  "/api/search",
  "/api/reviews",
  "/api/contacts",
  "/api/faqs",
])

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
