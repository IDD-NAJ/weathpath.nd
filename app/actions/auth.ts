"use server"

/**
 * app/actions/auth.ts
 *
 * Server actions for auth flows. With Clerk handling credentials, the
 * bcrypt login/signup actions are no longer used for new users. The
 * file is kept so any remaining import site continues to compile;
 * logoutAction is a lightweight redirect that works as a fallback for
 * server-side code that calls it.
 *
 * The active sign-in / sign-up flows live in the Clerk-powered
 * client components at app/login/page.tsx and app/signup/page.tsx.
 */

import { redirect } from "next/navigation"

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  redirectTo?: string
}

/**
 * logoutAction — kept as a named export so existing call sites compile.
 * The /logout page now uses useClerk().signOut() directly, which is the
 * correct Clerk pattern. Server-side callers can redirect to /logout.
 */
export async function logoutAction(): Promise<void> {
  redirect("/logout")
}

/**
 * loginAction and signupAction are kept as stubs so TypeScript call sites
 * that import them don't break. They should not be called; direct users to
 * the Clerk-backed login/signup pages instead.
 */
export async function loginAction(
  _prev: AuthState,
  _formData: FormData
): Promise<AuthState> {
  return { error: "Login is now handled by Clerk. Please use the sign-in page." }
}

export async function signupAction(
  _prev: AuthState,
  _formData: FormData
): Promise<AuthState> {
  return { error: "Signup is now handled by Clerk. Please use the sign-up page." }
}
