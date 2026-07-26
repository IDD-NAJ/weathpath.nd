import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export type UserRole = "user" | "admin"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  profile_photo_url?: string | null
  bio?: string | null
  clerk_user_id?: string | null
}

type ClerkProfile = {
  clerkUserId: string
  email: string
  name: string
  imageUrl: string | null
  createdAt: string
  metadataRole: UserRole
}

/**
 * Mirrors the Clerk user into the local `users` table so the rest of the app
 * can keep joining on `users.id` (a UUID) for progress, favorites, articles, etc.
 * Clerk remains the source of truth for credentials and sessions.
 */
async function syncUser(profile: ClerkProfile): Promise<SessionUser> {
  const { clerkUserId, email, name, imageUrl, metadataRole } = profile

  const linked = await sql`
    SELECT id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_user_id
    FROM users
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `

  if (linked.length > 0) {
    const row = linked[0] as SessionUser
    const needsUpdate =
      (email && row.email !== email) || (name && row.name !== name)

    if (needsUpdate) {
      await sql`
        UPDATE users
        SET email = ${email || row.email},
            name = ${name || row.name},
            updated_at = now()
        WHERE id = ${row.id}
      `
      return { ...row, email: email || row.email, name: name || row.name }
    }

    return row
  }

  // Existing account created before Clerk — link it by email.
  if (email) {
    const byEmail = await sql`
      SELECT id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_user_id
      FROM users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `

    if (byEmail.length > 0) {
      const row = byEmail[0] as SessionUser
      await sql`
        UPDATE users
        SET clerk_user_id = ${clerkUserId}, updated_at = now()
        WHERE id = ${row.id}
      `
      return { ...row, clerk_user_id: clerkUserId }
    }
  }

  const inserted = await sql`
    INSERT INTO users (name, email, role, is_active, clerk_user_id, profile_photo_url)
    VALUES (${name}, ${email}, ${metadataRole}, true, ${clerkUserId}, ${imageUrl})
    ON CONFLICT (clerk_user_id) DO UPDATE
      SET name = EXCLUDED.name, email = EXCLUDED.email, updated_at = now()
    RETURNING id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_user_id
  `

  return inserted[0] as SessionUser
}

function toProfile(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>): ClerkProfile {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    ""

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email.split("@")[0] ||
    "Member"

  return {
    clerkUserId: clerkUser.id,
    email,
    name,
    imageUrl: clerkUser.imageUrl || null,
    createdAt: new Date(clerkUser.createdAt).toISOString(),
    metadataRole: clerkUser.publicMetadata?.role === "admin" ? "admin" : "user",
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const profile = toProfile(clerkUser)

  try {
    const user = await syncUser(profile)
    if (!user.is_active) return null
    return user
  } catch (error) {
    // The database may be unreachable (or not provisioned yet). Auth still works
    // because Clerk owns the session — we just fall back to the Clerk profile.
    console.error("[v0] Failed to sync Clerk user with database:", error)
    return {
      id: profile.clerkUserId,
      email: profile.email,
      name: profile.name,
      role: profile.metadataRole,
      is_active: true,
      created_at: profile.createdAt,
      profile_photo_url: profile.imageUrl,
      bio: null,
      clerk_user_id: profile.clerkUserId,
    }
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
