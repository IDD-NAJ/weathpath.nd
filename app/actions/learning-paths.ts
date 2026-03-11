"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const pathSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().optional(),
  module_count: z.coerce.number().int().min(0).default(0),
  topics: z.string().optional(),
  is_published: z.coerce.boolean().default(false),
})

export async function getLearningPaths() {
  return sql`SELECT * FROM learning_paths ORDER BY created_at DESC`
}

export async function getLearningPathById(id: string) {
  const rows = await sql`SELECT * FROM learning_paths WHERE id = ${id}`
  return rows[0] || null
}

export async function createLearningPath(formData: FormData) {
  await requireAdmin()

  const parsed = pathSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    duration: formData.get("duration"),
    module_count: formData.get("module_count"),
    topics: formData.get("topics"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { title, description, level, duration, module_count, topics, is_published } = parsed.data
  const topicsArray = topics
    ? topics.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  await sql`
    INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published)
    VALUES (${title}, ${description || ""}, ${level}, ${duration || ""}, ${module_count}, ${topicsArray}, ${is_published})
  `

  revalidatePath("/admin/learning-paths")
  return { success: true }
}

export async function updateLearningPath(id: string, formData: FormData) {
  await requireAdmin()

  const parsed = pathSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    duration: formData.get("duration"),
    module_count: formData.get("module_count"),
    topics: formData.get("topics"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { title, description, level, duration, module_count, topics, is_published } = parsed.data
  const topicsArray = topics
    ? topics.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  await sql`
    UPDATE learning_paths
    SET title = ${title}, description = ${description || ""}, level = ${level},
        duration = ${duration || ""}, module_count = ${module_count},
        topics = ${topicsArray}, is_published = ${is_published}, updated_at = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/admin/learning-paths")
  return { success: true }
}

export async function deleteLearningPath(id: string) {
  await requireAdmin()
  await sql`DELETE FROM learning_paths WHERE id = ${id}`
  revalidatePath("/admin/learning-paths")
}

export async function toggleLearningPathPublished(id: string, published: boolean) {
  await requireAdmin()
  await sql`UPDATE learning_paths SET is_published = ${published}, updated_at = NOW() WHERE id = ${id}`
  revalidatePath("/admin/learning-paths")
}
