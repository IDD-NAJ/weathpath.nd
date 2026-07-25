import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const reviews = await sql(`
      SELECT 
        r.id, r.rating, r.comment, r.status, r.created_at,
        r.content_type, r.content_id,
        u.email, u.name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [status, limit, offset])

    const countResult = await sql(`
      SELECT COUNT(*) as count FROM reviews WHERE status = $1
    `, [status])

    return NextResponse.json({
      reviews,
      total: countResult[0].count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("[v0] Failed to fetch reviews:", error.message)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewId, status, reason } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql(`
      UPDATE reviews
      SET status = $1, moderation_reason = $2, moderated_at = CURRENT_TIMESTAMP, moderated_by = $3
      WHERE id = $4
      RETURNING *
    `, [status, reason || null, user.id, reviewId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ review: result[0] })
  } catch (error: any) {
    console.error("[v0] Failed to update review:", error.message)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}
