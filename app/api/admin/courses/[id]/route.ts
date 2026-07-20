import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql(
      `SELECT * FROM courses WHERE id = $1`,
      [courseId]
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course: result[0] })
  } catch (error: any) {
    console.error("[v0] Failed to fetch course:", error.message)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const { title, description, price_cents, category, level, lessons, is_visible, status } = await request.json()

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price_cents = COALESCE($3, price_cents),
           category = COALESCE($4, category),
           level = COALESCE($5, level),
           lessons = COALESCE($6, lessons),
           is_visible = COALESCE($7, is_visible),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, price_cents, category, level, lessons, is_visible, status, courseId]
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course: result[0] })
  } catch (error: any) {
    console.error("[v0] Failed to update course:", error.message)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [courseId]
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Course deleted" })
  } catch (error: any) {
    console.error("[v0] Failed to delete course:", error.message)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
