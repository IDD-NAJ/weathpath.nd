import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST /api/coupons/validate  { code }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const code = String(body.code || "").trim().toUpperCase()
    if (!code) {
      return NextResponse.json({ valid: false, error: "Enter a coupon code" }, { status: 400 })
    }

    const rows = await sql`
      SELECT id, code, percent_off, expires_at, max_redemptions, times_redeemed
      FROM coupons
      WHERE code = ${code} AND active = true
    `
    const coupon = rows[0]

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 404 })
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 410 })
    }
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its redemption limit" }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      percent_off: coupon.percent_off,
    })
  } catch (error) {
    console.error("[v0] Coupon validate error:", error)
    return NextResponse.json({ valid: false, error: "Unable to validate coupon" }, { status: 500 })
  }
}
