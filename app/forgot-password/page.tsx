import { redirect } from "next/navigation"

// Password resets are handled by Clerk's built-in "Forgot password?" flow on the
// sign-in screen, which sends a real reset email. This route is kept so existing
// links and bookmarks land in the right place.
export default function ForgotPasswordPage() {
  redirect("/login/forgot-password")
}
