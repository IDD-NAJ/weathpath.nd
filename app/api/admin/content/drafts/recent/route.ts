import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    await requireAdmin()

    // Fetch recent content drafts with author information
    const recentDrafts = await sql`
      SELECT 
        cd.id,
        cd.title,
        cd.type,
        cd.status,
        cd.created_at,
        cd.updated_at,
        cd.summary,
        u.name as author_name,
        u.email as author_email
      FROM content_drafts cd
      LEFT JOIN users u ON cd.author_id = u.id
      ORDER BY cd.updated_at DESC
      LIMIT 10
    `

    return NextResponse.json({ 
      success: true, 
      drafts: recentDrafts 
    })
  } catch (error) {
    console.error('Recent drafts API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch recent drafts' 
    }, { status: 500 })
  }
}
