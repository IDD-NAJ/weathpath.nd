import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/admin/reviews?status=pending
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    const reviews =
      status === "all"
        ? await sql`
            SELECT r.*, u.name AS author_name, u.email AS author_email
            FROM reviews r JOIN users u ON u.id = r.user_id
            ORDER BY r.created_at DESC LIMIT 200
          `
        : await sql`
            SELECT r.*, u.name AS author_name, u.email AS author_email
            FROM reviews r JOIN users u ON u.id = r.user_id
            WHERE r.status = ${status}
            ORDER BY r.created_at DESC LIMIT 200
          `

    const counts = await sql`
      SELECT status, COUNT(*)::int AS count FROM reviews GROUP BY status
    `
    const countMap: Record<string, number> = {}
    for (const row of counts) countMap[row.status] = row.count

    return NextResponse.json({ reviews, counts: countMap })
  } catch (error) {
    console.error("[v0] Admin reviews GET error:", error)
    return NextResponse.json({ reviews: [], counts: {} })
  }
}

// PATCH /api/admin/reviews  { id, status: 'approved' | 'rejected' }
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const id = String(body.id || "")
    const status = String(body.status || "")
    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }
    const rows = await sql`
      UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING id, status
    `
    if (rows.length === 0) return NextResponse.json({ error: "Review not found" }, { status: 404 })
    return NextResponse.json({ review: rows[0] })
  } catch (error) {
    console.error("[v0] Admin reviews PATCH error:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

// DELETE /api/admin/reviews?id=...
export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await sql`DELETE FROM reviews WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin reviews DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
