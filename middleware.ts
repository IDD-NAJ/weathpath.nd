import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/login",
    "/signup",
    "/courses",
    "/articles",
    "/stories",
    "/community",
    "/faq",
    "/contact",
    "/pricing",
    "/api/search",
    "/api/reviews",
    "/api/contacts",
    "/api/faqs",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
