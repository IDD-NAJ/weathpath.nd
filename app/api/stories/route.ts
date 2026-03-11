import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, title, quote, income, strategy
      FROM success_stories
      WHERE is_published = true
      ORDER BY display_order ASC, created_at DESC
    `
    return NextResponse.json({ stories: rows })
  } catch {
    return NextResponse.json({ stories: [] })
  }
}
