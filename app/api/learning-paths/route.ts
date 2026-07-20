import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const rows = await sql`
      SELECT id, title, description, level, duration, module_count, topics, is_published, created_at, updated_at
      FROM learning_paths
      WHERE is_published = true
      ORDER BY created_at ASC
    `
    return NextResponse.json({ learningPaths: rows })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json({ learningPaths: [] })
  }
}
