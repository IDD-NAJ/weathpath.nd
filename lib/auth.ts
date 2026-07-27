/**
 * lib/auth.ts — Clerk-backed auth layer
 *
 * Public API (unchanged names, unchanged SessionUser shape):
 *   getCurrentUser()  → SessionUser | null
 *   requireAuth()     → SessionUser   (redirects to /login)
 *   requireAdmin()    → SessionUser   (redirects to / if not admin)
 *
 * On every call we resolve the Clerk user_id → internal UUID via the
 * `users.clerk_id` column, upsert the row on first sign-in (linking by
 * email so existing accounts keep their role + data), and return the
 * familiar SessionUser shape used by all 44 call sites.
 */

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export type UserRole = "user" | "admin"

export interface SessionUser {
  id: string                       // internal UUID — safe to use in all FK queries
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  profile_photo_url?: string | null
  bio?: string | null
  clerk_id: string                 // Clerk user_xxx — available if callers need it
}

/**
 * Resolves a Clerk session into an internal SessionUser row.
 * On the very first sign-in the row is upserted:
 *   - If a row with the same email already exists it is linked (clerk_id set)
 *     so the existing role, progress, and content authorship survive.
 *   - Otherwise a new row is created with role='user'.
 */
async function resolveClerkUser(clerkId: string): Promise<SessionUser | null> {
  try {
    // Fast path: clerk_id already linked
    const existing = (await sql`
      SELECT id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_id
      FROM users
      WHERE clerk_id = ${clerkId}
        AND is_active = true
      LIMIT 1
    `) as SessionUser[]
    if (existing.length > 0) {
      console.log("[v0] Clerk user found in DB:", { userId: existing[0].id, email: existing[0].email })
      return existing[0]
    }

    // First-time sign-in: fetch the Clerk profile to get email + name
    const clerkUser = await currentUser()
    if (!clerkUser) {
      console.log("[v0] Clerk user not found in session")
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""
    const firstName = clerkUser.firstName ?? ""
    const lastName = clerkUser.lastName ?? ""
    const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0]
    const imageUrl = clerkUser.imageUrl ?? null

    if (!email) {
      console.log("[v0] No email found in Clerk user profile")
      return null
    }

    console.log("[v0] First-time sign-in: creating/linking user", { email, name, clerkId })

    // Link-by-email: if an existing user row has this email, attach the clerk_id
    const linked = (await sql`
      UPDATE users
      SET clerk_id = ${clerkId},
          profile_photo_url = COALESCE(profile_photo_url, ${imageUrl}),
          updated_at = NOW()
      WHERE email = ${email}
        AND clerk_id IS NULL
        AND is_active = true
      RETURNING id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_id
    `) as SessionUser[]
    if (linked.length > 0) {
      console.log("[v0] Linked existing user to Clerk:", { userId: linked[0].id, email })
      return linked[0]
    }

    // Brand-new user: create a row with role='user'
    const newId = crypto.randomUUID()
    console.log("[v0] Creating new user in DB", { newId, email, clerkId })
    const created = (await sql`
      INSERT INTO users (id, name, email, clerk_id, role, is_active, profile_photo_url)
      VALUES (${newId}, ${name}, ${email}, ${clerkId}, 'user', true, ${imageUrl})
      ON CONFLICT (email) DO UPDATE
        SET clerk_id = EXCLUDED.clerk_id,
            profile_photo_url = COALESCE(users.profile_photo_url, EXCLUDED.profile_photo_url),
            updated_at = NOW()
      RETURNING id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_id
    `) as SessionUser[]
    
    if (created.length > 0) {
      console.log("[v0] New user created:", { userId: created[0].id, email })
      return created[0]
    }
    
    console.log("[v0] Failed to create user:", { email })
    return null
  } catch (err) {
    console.error("[v0] Error resolving Clerk user:", { clerkId, error: err instanceof Error ? err.message : String(err) })
    return null
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const { userId } = await auth()
    if (!userId) {
      console.log("[v0] No Clerk session found")
      return null
    }
    console.log("[v0] Clerk session found:", { userId })
    return resolveClerkUser(userId)
  } catch (err) {
    console.error("[v0] Error getting current user:", err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== "admin") redirect("/")
  return user
}

// ---------------------------------------------------------------------------
// Legacy no-ops kept so existing import sites compile without changes.
// bcrypt/sessions are no longer used; Clerk manages credential storage.
// ---------------------------------------------------------------------------
export async function hashPassword(_password: string): Promise<string> {
  throw new Error("hashPassword is no longer used. Auth is handled by Clerk.")
}

export async function verifyPassword(_password: string, _hash: string): Promise<boolean> {
  throw new Error("verifyPassword is no longer used. Auth is handled by Clerk.")
}

export async function createSession(_userId: string): Promise<string> {
  throw new Error("createSession is no longer used. Auth is handled by Clerk.")
}

export async function destroySession(): Promise<void> {
  // No-op: callers should use Clerk's signOut() client-side, or
  // the /logout page which calls useClerk().signOut()
}
