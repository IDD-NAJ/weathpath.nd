"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const storySchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  quote: z.string().min(1, "Quote is required"),
  income: z.string().optional(),
  strategy: z.string().optional(),
  avatar_url: z.string().optional(),
  display_order: z.coerce.number().int().min(0).default(0),
  is_published: z.coerce.boolean().default(false),
})

export async function getStories() {
  return sql`SELECT * FROM success_stories ORDER BY display_order ASC, created_at DESC`
}

export async function createStory(formData: FormData) {
  await requireAdmin()

  const parsed = storySchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    quote: formData.get("quote"),
    income: formData.get("income"),
    strategy: formData.get("strategy"),
    avatar_url: formData.get("avatar_url"),
    display_order: formData.get("display_order"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data

  await sql`
    INSERT INTO success_stories (name, title, quote, income, strategy, avatar_url, display_order, is_published)
    VALUES (${d.name}, ${d.title}, ${d.quote}, ${d.income || ""}, ${d.strategy || ""}, ${d.avatar_url || ""}, ${d.display_order}, ${d.is_published})
  `

  revalidatePath("/admin/stories")
  return { success: true }
}

export async function updateStory(id: string, formData: FormData) {
  await requireAdmin()

  const parsed = storySchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    quote: formData.get("quote"),
    income: formData.get("income"),
    strategy: formData.get("strategy"),
    avatar_url: formData.get("avatar_url"),
    display_order: formData.get("display_order"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data

  await sql`
    UPDATE success_stories
    SET name = ${d.name}, title = ${d.title}, quote = ${d.quote},
        income = ${d.income || ""}, strategy = ${d.strategy || ""},
        avatar_url = ${d.avatar_url || ""}, display_order = ${d.display_order},
        is_published = ${d.is_published}, updated_at = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/admin/stories")
  return { success: true }
}

export async function deleteStory(id: string) {
  await requireAdmin()
  await sql`DELETE FROM success_stories WHERE id = ${id}`
  revalidatePath("/admin/stories")
}
