import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const courseId = searchParams.get("courseId")

    if (!email || !courseId) {
      return NextResponse.json(
        { error: "Email and courseId are required" },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql(
      `SELECT id, payment_status FROM user_purchases 
       WHERE user_email = $1 AND course_id = $2`,
      [email, parseInt(courseId)]
    )

    const hasPurchase = result.length > 0 && result[0].payment_status === "confirmed"

    return NextResponse.json({
      hasPurchase,
      purchase: hasPurchase ? result[0] : null,
    })
  } catch (error: any) {
    console.error("[v0] Failed to check purchase:", error.message)
    return NextResponse.json(
      { error: "Failed to check purchase status" },
      { status: 500 }
    )
  }
}
