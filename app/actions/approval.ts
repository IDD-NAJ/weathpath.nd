"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const statusSchema = z.enum(["draft", "pending", "approved", "rejected"])

type ContentType = "articles" | "success_stories" | "learning_paths" | "quizzes"

const validTables: ContentType[] = ["articles", "success_stories", "learning_paths", "quizzes"]

export async function updateContentStatus(
  table: ContentType,
  id: string,
  status: string
) {
  await requireAdmin()

  const parsed = statusSchema.safeParse(status)
  if (!parsed.success) {
    return { error: "Invalid status" }
  }

  if (!validTables.includes(table)) {
    return { error: "Invalid content type" }
  }

  const isPublished = parsed.data === "approved"

  // Using parameterized queries - table name is validated above
  if (table === "articles") {
    await sql`
      UPDATE articles SET status = ${parsed.data}, is_published = ${isPublished}, updated_at = NOW()
      WHERE id = ${id}
    `
  } else if (table === "success_stories") {
    await sql`
      UPDATE success_stories SET status = ${parsed.data}, is_published = ${isPublished}, updated_at = NOW()
      WHERE id = ${id}
    `
  } else if (table === "learning_paths") {
    await sql`
      UPDATE learning_paths SET status = ${parsed.data}, is_published = ${isPublished}, updated_at = NOW()
      WHERE id = ${id}
    `
  } else if (table === "quizzes") {
    await sql`
      UPDATE quizzes SET status = ${parsed.data}, is_published = ${isPublished}, updated_at = NOW()
      WHERE id = ${id}
    `
  }

  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/stories")
  revalidatePath("/admin/learning-paths")
  revalidatePath("/stories")
  revalidatePath("/articles")
  return { success: true }
}

export async function getPendingContent() {
  await requireAdmin()

  const [articles, stories, paths, quizzes] = await Promise.all([
    sql`SELECT id, title, slug, excerpt, category, status, created_at, 'article' as type FROM articles WHERE status = 'pending' ORDER BY created_at DESC`,
    sql`SELECT id, name, title, quote, strategy, status, created_at, 'story' as type FROM success_stories WHERE status = 'pending' ORDER BY created_at DESC`,
    sql`SELECT id, title, description, difficulty, status, created_at, 'learning_path' as type FROM learning_paths WHERE status = 'pending' ORDER BY created_at DESC`,
    sql`SELECT id, title, description, difficulty, status, created_at, 'quiz' as type FROM quizzes WHERE status = 'pending' ORDER BY created_at DESC`,
  ])

  return {
    articles,
    stories,
    paths,
    quizzes,
    total: articles.length + stories.length + paths.length + quizzes.length,
  }
}

export async function getAllContentWithStatus() {
  await requireAdmin()

  const [articles, stories, paths, quizzes] = await Promise.all([
    sql`SELECT id, title, slug, category, status, is_published, created_at FROM articles ORDER BY created_at DESC`,
    sql`SELECT id, name, title, status, is_published, created_at FROM success_stories ORDER BY display_order ASC, created_at DESC`,
    sql`SELECT id, title, difficulty, status, is_published, created_at FROM learning_paths ORDER BY created_at DESC`,
    sql`SELECT id, title, difficulty, status, is_published, created_at FROM quizzes ORDER BY created_at DESC`,
  ])

  return { articles, stories, paths, quizzes }
}
