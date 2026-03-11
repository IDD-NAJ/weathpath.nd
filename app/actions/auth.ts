"use server"

import { sql } from "@/lib/db"
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  redirectTo?: string
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data

  const rows = await sql`
    SELECT id, password_hash, is_active, role FROM users WHERE email = ${email}
  `

  if (rows.length === 0) {
    return { error: "Invalid email or password" }
  }

  const user = rows[0]

  if (!user.is_active) {
    return { error: "Your account has been deactivated. Please contact support." }
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user.id)

  // Return success with redirect path instead of calling redirect() directly.
  // This avoids the Next.js issue where redirect() throws inside server actions
  // and can interfere with the Set-Cookie header being applied before navigation.
  const redirectTo = user.role === "admin" ? "/admin" : "/dashboard"
  return { success: true, redirectTo }
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing.length > 0) {
    return { error: "An account with this email already exists" }
  }

  const passwordHash = await hashPassword(password)
  const userId = crypto.randomUUID()

  await sql`
    INSERT INTO users (id, name, email, password_hash, role, is_active)
    VALUES (${userId}, ${name}, ${email}, ${passwordHash}, 'user', true)
  `

  await createSession(userId)
  redirect("/dashboard")
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/")
}
