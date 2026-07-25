import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const coupons = await sql`
      SELECT id, code, percent_off, active, expires_at, max_redemptions, times_redeemed, created_at
      FROM coupons
      ORDER BY created_at DESC
    `
    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("[v0] Coupons GET error:", error)
    return NextResponse.json({ coupons: [] })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const code = String(body.code || "").trim().toUpperCase()
    const percentOff = Number.parseInt(String(body.percent_off), 10)
    const expiresAt = body.expires_at || null
    const maxRedemptions = body.max_redemptions ? Number.parseInt(String(body.max_redemptions), 10) : null

    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Code must be at least 3 characters" }, { status: 400 })
    }
    if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
      return NextResponse.json({ error: "Percent off must be between 1 and 100" }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO coupons (code, percent_off, expires_at, max_redemptions)
      VALUES (${code}, ${percentOff}, ${expiresAt}, ${maxRedemptions})
      RETURNING *
    `
    return NextResponse.json({ coupon: rows[0] })
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 })
    }
    console.error("[v0] Coupons POST error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
