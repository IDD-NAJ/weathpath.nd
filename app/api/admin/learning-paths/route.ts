import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query
    if (status) {
      query = sql`
        SELECT lp.*, u.name as author_name
        FROM learning_paths lp
        LEFT JOIN users u ON lp.author_id = u.id
        WHERE lp.status = ${status}
        ORDER BY lp.created_at DESC
      `
    } else {
      query = sql`
        SELECT lp.*, u.name as author_name
        FROM learning_paths lp
        LEFT JOIN users u ON lp.author_id = u.id
        ORDER BY lp.created_at DESC
      `
    }
    
    const paths = await query
    
    return NextResponse.json({ success: true, paths })
  } catch (error) {
    console.error('Learning paths API error:', error)
    return NextResponse.json({ error: 'Failed to fetch learning paths' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    
    const { title, description, content, difficulty, duration, slug, author_name, status } = body
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const result = await sql`
      INSERT INTO learning_paths (
        title, slug, description, content, difficulty, duration, author_id, status, is_published, created_at, updated_at
      ) VALUES (
        ${title}, ${generatedSlug}, ${description || ''}, ${content || ''}, ${difficulty || 'beginner'}, 
        ${duration || '30 mins'}, ${user.id}, ${status || 'draft'}, ${status === 'published'}, NOW(), NOW()
      )
      RETURNING *
    `
    
    return NextResponse.json({ success: true, path: result[0] })
  } catch (error) {
    console.error('Learning paths API error:', error)
    return NextResponse.json({ error: 'Failed to create learning path' }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const { id, title, description, difficulty, duration, slug, status, is_published } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 })
    }
    
    const result = await sql`
      UPDATE learning_paths
      SET 
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        description = COALESCE(${description}, description),
        difficulty = COALESCE(${difficulty}, difficulty),
        duration = COALESCE(${duration}, duration),
        status = COALESCE(${status}, status),
        is_published = COALESCE(${is_published}, is_published),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json({ success: true, path: result[0] })
  } catch (error) {
    console.error('Learning paths API error:', error)
    return NextResponse.json({ error: 'Failed to update learning path' }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 })
    }
    
    await sql`DELETE FROM learning_paths WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Learning paths API error:', error)
    return NextResponse.json({ error: 'Failed to delete learning path' }, { status: 500 })
  }
}
