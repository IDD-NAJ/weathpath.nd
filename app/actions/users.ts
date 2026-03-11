"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUsers(search?: string) {
  await requireAdmin()

  if (search && search.trim()) {
    const term = `%${search.trim()}%`
    return sql`
      SELECT id, name, email, role, is_active, created_at, updated_at
      FROM users
      WHERE name ILIKE ${term} OR email ILIKE ${term}
      ORDER BY created_at DESC
    `
  }

  return sql`
    SELECT id, name, email, role, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  const admin = await requireAdmin()

  if (admin.id === userId) {
    throw new Error("You cannot change your own role")
  }

  await sql`UPDATE users SET role = ${role}, updated_at = NOW() WHERE id = ${userId}`
  revalidatePath("/admin/users")
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const admin = await requireAdmin()

  if (admin.id === userId) {
    throw new Error("You cannot deactivate your own account")
  }

  await sql`UPDATE users SET is_active = ${isActive}, updated_at = NOW() WHERE id = ${userId}`
  revalidatePath("/admin/users")
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin()

  if (admin.id === userId) {
    throw new Error("You cannot delete your own account")
  }

  await sql`DELETE FROM sessions WHERE user_id = ${userId}`
  await sql`DELETE FROM users WHERE id = ${userId}`
  revalidatePath("/admin/users")
}

export async function getUserStats() {
  await requireAdmin()

  const totalResult = await sql`SELECT COUNT(*) as count FROM users`
  const activeResult = await sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`
  const adminResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`
  const recentResult = await sql`
    SELECT COUNT(*) as count FROM users
    WHERE created_at > NOW() - INTERVAL '7 days'
  `

  return {
    total: Number(totalResult[0].count),
    active: Number(activeResult[0].count),
    admins: Number(adminResult[0].count),
    recentSignups: Number(recentResult[0].count),
  }
}
