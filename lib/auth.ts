import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

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
}

const SESSION_COOKIE = "wp_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID()

  // Use DB-side NOW() to avoid JS/Postgres clock skew
  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, NOW() + INTERVAL '7 days')
  `

  // Clean up any expired sessions for this user
  await sql`DELETE FROM sessions WHERE user_id = ${userId} AND expires_at <= NOW()`

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    // Only use Secure flag on actual production deploys (HTTPS).
    // Preview/development environments may run on HTTP, which silently
    // drops Secure cookies and breaks the session entirely.
    secure: process.env.VERCEL_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })

  return sessionId
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    cookieStore.delete(SESSION_COOKIE)
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value

    if (!sessionId) return null

    const rows = await sql`
      SELECT u.id, u.email, u.name, u.role, u.is_active, u.created_at, u.profile_photo_url, u.bio
      FROM users u
      INNER JOIN sessions s ON s.user_id = u.id
      WHERE s.id = ${sessionId}
        AND s.expires_at > NOW()
        AND u.is_active = true
    `

    if (rows.length === 0) {
      // Session expired or invalid — clean up the stale cookie
      cookieStore.delete(SESSION_COOKIE)
      return null
    }
    return rows[0] as SessionUser
  } catch {
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
