import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { 
  saveContentDraft, 
  getDrafts, 
  updateDraft, 
  deleteDraft, 
  submitForApproval 
} from "@/lib/content-manager"

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    console.log('🔧 POST /api/admin/content/drafts - Current user:', currentUser?.id, currentUser?.email)
    
    if (!currentUser || currentUser.role !== "admin") {
      console.log('❌ Unauthorized - user not admin or not logged in')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📋 Request body:', { action: body.action, title: body.title, type: body.type })
    const { action, ...data } = body

    switch (action) {
      case 'save':
        const draft = await saveContentDraft({
          ...data,
          authorId: currentUser.id
        })
        return NextResponse.json({ success: true, draft })
      
      case 'submit_for_approval':
        await submitForApproval(data.id, currentUser.id)
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Content drafts API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
}


export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

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

    let query = `
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
    `

    const params: any[] = []
    
    if (status) {
      query += ` WHERE cd.status = $1`
      params.push(status)
    }

    query += ` ORDER BY cd.updated_at DESC`

    const drafts = await sql(query, params)

    // Parse JSON fields safely - JSONB fields are already objects from PostgreSQL
    const parsedDrafts = drafts.map((draft: any) => {
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
    console.error("Content drafts API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch drafts" },
      { status: 500 }
    )
  }
}


export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    await updateDraft(id, currentUser.id, updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Content drafts API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update draft" },
      { status: 500 }
    )
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      )
    }

    await deleteDraft(id, currentUser.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Content drafts API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete draft" },
      { status: 500 }
    )
  }
}
