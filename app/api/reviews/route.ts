import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

const VALID_TYPES = ["course", "article", "story"]

// GET /api/reviews?content_type=course&content_id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get("content_type")
  const contentId = searchParams.get("content_id")

  if (!contentType || !contentId || !VALID_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  }

  try {
    const user = await getCurrentUser()

    const [reviews, summary] = await Promise.all([
      sql`
        SELECT r.id, r.rating, r.title, r.body, r.created_at, u.name AS author_name, u.profile_photo_url
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.content_type = ${contentType} AND r.content_id = ${contentId} AND r.status = 'approved'
        ORDER BY r.created_at DESC
        LIMIT 50
      `,
      sql`
        SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*)::int AS total
        FROM reviews
        WHERE content_type = ${contentType} AND content_id = ${contentId} AND status = 'approved'
      `,
    ])

    let myReview = null
    if (user) {
      const mine = await sql`
        SELECT id, rating, title, body, status, created_at
        FROM reviews
        WHERE user_id = ${user.id} AND content_type = ${contentType} AND content_id = ${contentId}
      `
      myReview = mine[0] || null
    }

    return NextResponse.json({
      reviews,
      average: summary[0]?.avg_rating ? Number(summary[0].avg_rating) : null,
      total: summary[0]?.total || 0,
      myReview,
      isLoggedIn: Boolean(user),
    })
  } catch (error) {
    console.error("[v0] Reviews GET error:", error)
    return NextResponse.json({ reviews: [], average: null, total: 0, myReview: null, isLoggedIn: false })
  }
}

// POST /api/reviews  { content_type, content_id, rating, title, body }
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to leave a review" }, { status: 401 })
    }

    const payload = await request.json()
    const contentType = String(payload.content_type || "")
    const contentId = String(payload.content_id || "")
    const rating = Number.parseInt(String(payload.rating), 10)
    const title = payload.title ? String(payload.title).slice(0, 200) : null
    const body = payload.body ? String(payload.body).slice(0, 4000) : null

    if (!contentType || !contentId || !VALID_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO reviews (user_id, content_type, content_id, rating, title, body, status)
      VALUES (${user.id}, ${contentType}, ${contentId}, ${rating}, ${title}, ${body}, 'pending')
      ON CONFLICT (user_id, content_type, content_id)
      DO UPDATE SET rating = EXCLUDED.rating, title = EXCLUDED.title, body = EXCLUDED.body,
                    status = 'pending', updated_at = NOW()
      RETURNING id, rating, title, body, status, created_at
    `

    return NextResponse.json({ review: rows[0], message: "Review submitted and pending approval" })
  } catch (error) {
    console.error("[v0] Reviews POST error:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
