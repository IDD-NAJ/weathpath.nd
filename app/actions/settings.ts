"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  const rows = await sql`SELECT key, value FROM site_settings ORDER BY key`
  const settings: Record<string, unknown> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }
  return settings
}

export async function updateSetting(key: string, value: unknown) {
  await requireAdmin()

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW()
  `

  revalidatePath("/admin/settings")
}

export async function updateMultipleSettings(
  entries: { key: string; value: unknown }[]
) {
  await requireAdmin()

  for (const entry of entries) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${entry.key}, ${JSON.stringify(entry.value)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(entry.value)}, updated_at = NOW()
    `
  }

  revalidatePath("/admin/settings")
}
