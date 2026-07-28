import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * SSO Callback Handler for Login
 * 
 * This page handles OAuth redirects from Clerk after users authenticate
 * with providers like Google or GitHub during login.
 * 
 * The AuthenticateWithRedirectCallback component:
 * - Verifies the OAuth callback from the provider
 * - Creates/resumes the Clerk session
 * - Redirects to the configured post-signin URL (/dashboard)
 */
export default function LoginSSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
