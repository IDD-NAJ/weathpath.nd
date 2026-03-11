import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await requireAdmin()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // First check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_drafts'
      ) as exists
    `

    if (!tableExists[0]?.exists) {
      console.log('content_drafts table does not exist')
      return NextResponse.json({ 
        success: true, 
        drafts: [] 
      })
    }

    // Fetch all content drafts with author information
    const allDrafts = await sql`
      SELECT 
        cd.id,
        cd.title,
        cd.type,
        cd.status,
        cd.content,
        cd.summary,
        cd.difficulty,
        cd.tone,
        cd.audience,
        cd.tags,
        cd.key_points,
        cd.estimated_read_time,
        cd.image_url,
        cd.image_alt,
        cd.image_caption,
        cd.image_attribution,
        cd.created_at,
        cd.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM content_drafts cd
      LEFT JOIN users u ON cd.author_id = u.id
      ORDER BY cd.updated_at DESC
    `

    // Parse JSON fields safely - JSONB fields are already objects from PostgreSQL
    const parsedDrafts = allDrafts.map((draft: any) => {
      return {
        ...draft,
        tags: typeof draft.tags === 'string' ? (draft.tags ? JSON.parse(draft.tags) : null) : draft.tags,
        key_points: typeof draft.key_points === 'string' ? (draft.key_points ? JSON.parse(draft.key_points) : null) : draft.key_points
      }
    })

    return NextResponse.json({ 
      success: true, 
      drafts: parsedDrafts 
    })
  } catch (error) {
    console.error('All drafts API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch drafts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
