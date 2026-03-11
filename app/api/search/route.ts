import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const pattern = `%${q}%`

  try {
    const [stories, paths, articles] = await Promise.all([
      sql`
        SELECT id, name AS title, quote AS description
        FROM success_stories
        WHERE is_published = true
          AND (name ILIKE ${pattern} OR title ILIKE ${pattern} OR quote ILIKE ${pattern} OR strategy ILIKE ${pattern})
        LIMIT 5
      `,
      sql`
        SELECT id, title, description
        FROM learning_paths
        WHERE is_published = true
          AND (title ILIKE ${pattern} OR description ILIKE ${pattern})
        LIMIT 5
      `,
      sql`
        SELECT id, title, slug, excerpt AS description
        FROM articles
        WHERE is_published = true
          AND (title ILIKE ${pattern} OR content ILIKE ${pattern} OR excerpt ILIKE ${pattern})
        LIMIT 5
      `,
    ])

    const results = [
      ...stories.map((s: Record<string, string>) => ({
        id: s.id,
        type: "story" as const,
        title: s.title,
        description: (s.description || "").slice(0, 100),
        href: `/stories/${s.id}`,
      })),
      ...paths.map((p: Record<string, string>) => ({
        id: p.id,
        type: "path" as const,
        title: p.title,
        description: (p.description || "").slice(0, 100),
        href: `/#learn`,
      })),
      ...articles.map((a: Record<string, string>) => ({
        id: a.id,
        type: "article" as const,
        title: a.title,
        description: (a.description || "").slice(0, 100),
        href: `/articles/${a.slug || a.id}`,
      })),
    ]

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
