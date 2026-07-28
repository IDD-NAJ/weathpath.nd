'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

/**
 * Auth Callback Page
 * 
 * After Clerk authentication completes, this page:
 * 1. Waits for the user session to load
 * 2. Fetches the user's role from the database
 * 3. Redirects to /admin or /dashboard based on role
 * 
 * Used as fallbackRedirectUrl in Clerk SignIn/SignUp components.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function handleRedirect() {
      if (!isLoaded || !user) {
        return // Still loading or not authenticated
      }

      try {
        // Fetch user profile from database to get role
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          const role = userData.role || 'user'

          if (role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          // Fallback to dashboard if fetch fails
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('[v0] Error fetching user role:', error)
        // Safe fallback: redirect to dashboard
        router.push('/dashboard')
      }
    }

    handleRedirect()
  }, [isLoaded, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Completing Sign In
        </h1>
        <p className="text-muted-foreground">
          Redirecting to your dashboard...
        </p>
        <div className="flex justify-center gap-1 pt-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
