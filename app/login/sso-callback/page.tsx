'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * SSO Callback Handler for Login
 * 
 * This page handles OAuth redirects from Clerk after users authenticate
 * with providers like Google or GitHub during login.
 * 
 * Clerk automatically handles the callback - this page just needs to exist
 * and Clerk will redirect to the configured post-signin URL.
 */
export default function LoginSSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Clerk handles the callback automatically and will redirect
    // If we reach here, redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Completing Sign In
        </h1>
        <p className="text-muted-foreground">
          Please wait while we process your authentication...
        </p>
      </div>
    </div>
  );
}
