import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

const VALID_TYPES = ["course", "article", "story"]
const VISITOR_COOKIE = "wp_vid"

// GET /api/views?content_type=course&content_id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get("content_type")
  const contentId = searchParams.get("content_id")

  if (!contentType || !contentId || !VALID_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  }

  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS views
      FROM content_views
      WHERE content_type = ${contentType} AND content_id = ${contentId}
    `
    return NextResponse.json({ views: rows[0]?.views || 0 })
  } catch (error) {
    console.error("[v0] Views GET error:", error)
    return NextResponse.json({ views: 0 })
  }
}

// POST /api/views  { content_type, content_id }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const contentType = String(body.content_type || "")
    const contentId = String(body.content_id || "")

    if (!contentType || !contentId || !VALID_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    const cookieStore = await cookies()
    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      cookieStore.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    // Deduped per visitor per day via unique constraint
    await sql`
      INSERT INTO content_views (content_type, content_id, visitor_hash)
      VALUES (${contentType}, ${contentId}, ${visitorId})
      ON CONFLICT (content_type, content_id, visitor_hash, viewed_on) DO NOTHING
    `

    const rows = await sql`
      SELECT COUNT(*)::int AS views
      FROM content_views
      WHERE content_type = ${contentType} AND content_id = ${contentId}
    `
    return NextResponse.json({ views: rows[0]?.views || 0 })
  } catch (error) {
    console.error("[v0] Views POST error:", error)
    return NextResponse.json({ views: 0 })
  }
}
