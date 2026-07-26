import { sql, getSql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    
    const courses = await sql(
      `SELECT id, slug, title, description, price_cents, category, level, lessons, 
              is_visible, status, created_at FROM courses ORDER BY created_at DESC`
    )
    return NextResponse.json({ courses })
  } catch (error: any) {
    console.error("[v0] Failed to fetch courses:", error.message)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, slug, price_cents, category, level, lessons } = await request.json()

    if (!title || !slug || !price_cents) {
      return NextResponse.json(
        { error: "Title, slug, and price are required" },
        { status: 400 }
      )
    }

    const sql = getSql()

    const result = await sql(
      `INSERT INTO courses (title, description, slug, price_cents, category, level, lessons, is_visible, status, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'published', '')
       RETURNING id, slug, title, description, price_cents, category, level, lessons, is_visible, status, created_at`,
      [title, description || "", slug, price_cents, category || "general", level || "beginner", lessons || 0]
    )

    return NextResponse.json({ course: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Failed to create course:", error.message)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
