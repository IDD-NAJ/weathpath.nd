'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

/**
 * Hook that redirects users after Clerk auth based on their role.
 * Must be used in a client component after Clerk session is established.
 * 
 * Usage:
 *   const router = useRouter()
 *   useRoleRedirect(router)
 * 
 * Routes to:
 *   - /admin if user.role === 'admin'
 *   - /dashboard if user.role === 'user'
 *   - /login if not authenticated
 */
export function useRoleRedirect(router: ReturnType<typeof useRouter>) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      // Not authenticated, let Clerk handle it (redirect already set in SignIn component)
      return
    }

    // User is authenticated with Clerk. Now check their role from the database.
    // The role is stored as public metadata in Clerk.
    const clerkMetadata = user.publicMetadata as Record<string, unknown>
    const userRole = clerkMetadata?.role as string | undefined

    if (userRole === 'admin') {
      router.push('/admin')
    } else if (userRole === 'user' || !userRole) {
      // Default to dashboard for regular users or if role not yet synced
      router.push('/dashboard')
    }
  }, [user, isLoaded, router])
}

/**
 * Helper to fetch the current user's role from the API.
 * Used when role isn't immediately available in Clerk metadata.
 */
export async function fetchUserRole(): Promise<string | null> {
  try {
    const response = await fetch('/api/user/profile')
    if (!response.ok) return null
    const data = await response.json()
    return data.role || null
  } catch (error) {
    console.error('[v0] Failed to fetch user role:', error)
    return null
  }
}
