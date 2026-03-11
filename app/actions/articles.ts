"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  is_published: z.coerce.boolean().default(false),
})

export async function getArticles() {
  return sql`
    SELECT a.*, u.name as author_name
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.created_at DESC
  `
}

export async function createArticle(formData: FormData, authorId: string) {
  await requireAdmin()

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { title, slug, content, excerpt, category, is_published } = parsed.data

  const existing = await sql`SELECT id FROM articles WHERE slug = ${slug}`
  if (existing.length > 0) {
    return { error: { slug: ["This slug is already in use"] } }
  }

  await sql`
    INSERT INTO articles (title, slug, content, excerpt, category, author_id, is_published)
    VALUES (${title}, ${slug}, ${content || ""}, ${excerpt || ""}, ${category || ""}, ${authorId}, ${is_published})
  `

  revalidatePath("/admin/articles")
  return { success: true }
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin()

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    is_published: formData.get("is_published") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { title, slug, content, excerpt, category, is_published } = parsed.data

  const existing = await sql`SELECT id FROM articles WHERE slug = ${slug} AND id != ${id}`
  if (existing.length > 0) {
    return { error: { slug: ["This slug is already in use"] } }
  }

  await sql`
    UPDATE articles
    SET title = ${title}, slug = ${slug}, content = ${content || ""},
        excerpt = ${excerpt || ""}, category = ${category || ""},
        is_published = ${is_published}, updated_at = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/admin/articles")
  return { success: true }
}

export async function deleteArticle(id: string) {
  await requireAdmin()
  await sql`DELETE FROM articles WHERE id = ${id}`
  revalidatePath("/admin/articles")
}
