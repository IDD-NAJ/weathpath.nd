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
    const { title, description, price_cents, category, level, lessons, is_visible, status, slug } = await request.json()

    const sql = neon(process.env.DATABASE_URL!)

    // Build update query dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount}`)
      values.push(slug)
      paramCount++
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }
    if (price_cents !== undefined) {
      updates.push(`price_cents = $${paramCount}`)
      values.push(price_cents)
      paramCount++
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`)
      values.push(category)
      paramCount++
    }
    if (level !== undefined) {
      updates.push(`level = $${paramCount}`)
      values.push(level)
      paramCount++
    }
    if (lessons !== undefined) {
      updates.push(`lessons = $${paramCount}`)
      values.push(lessons)
      paramCount++
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramCount}`)
      values.push(is_visible)
      paramCount++
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(courseId)

    const idParamPosition = paramCount + 1
    const query = `UPDATE courses SET ${updates.join(", ")} WHERE id = $${idParamPosition} RETURNING *`

    const result = await sql(query, values)

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course: result[0] })
  } catch (error: any) {
    console.error("[v0] Failed to update course:", error.message)
    return NextResponse.json({ error: `Failed to update course: ${error.message}` }, { status: 500 })
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
