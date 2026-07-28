import { handleRedirectCallback } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

/**
 * OAuth Callback Handler
 * 
 * This API route handles OAuth redirects from Clerk after users authenticate
 * with providers like Google or GitHub. It processes the callback and redirects
 * to the dashboard or appropriate page.
 */
export async function GET(req: NextRequest) {
  try {
    return await handleRedirectCallback(req);
  } catch (error) {
    console.error('[v0] OAuth callback error:', error);
    
    // Redirect to login if callback fails
    return new Response(null, {
      status: 307,
      headers: {
        Location: '/login',
      },
    });
  }
}
