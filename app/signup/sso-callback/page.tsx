import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * SSO Callback Handler
 * 
 * This page handles OAuth redirects from Clerk after users authenticate
 * with providers like Google or GitHub during signup.
 * 
 * The AuthenticateWithRedirectCallback component:
 * - Verifies the OAuth callback from the provider
 * - Creates/links the Clerk session
 * - Redirects to the configured post-signup URL (/dashboard)
 */
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
