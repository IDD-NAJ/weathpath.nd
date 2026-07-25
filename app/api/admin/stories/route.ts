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
        SELECT s.*, u.name as author_name
        FROM success_stories s
        LEFT JOIN users u ON s.author_id = u.id
        WHERE s.status = ${status}
        ORDER BY s.display_order ASC, s.created_at DESC
      `
    } else {
      query = sql`
        SELECT s.*, u.name as author_name
        FROM success_stories s
        LEFT JOIN users u ON s.author_id = u.id
        ORDER BY s.display_order ASC, s.created_at DESC
      `
    }
    
    const stories = await query
    
    return NextResponse.json({ success: true, stories })
  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    
    const { name, title, quote, income, strategy, slug, description, content, author_name, status } = body
    
    // Support both old format (name, quote) and new format (title, description, content)
    const finalTitle = title || name
    const finalContent = content || quote
    
    if (!finalTitle || !finalContent) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    
    const generatedSlug = slug || name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const result = await sql`
      INSERT INTO success_stories (
        name, title, content, description, income, strategy, slug, author_name, status, created_at
      ) VALUES (
        ${name || author_name}, ${finalTitle}, ${finalContent}, ${description || quote || ''}, ${income || ''}, ${strategy || ''}, 
        ${generatedSlug}, ${author_name || user.name || 'Admin'}, ${status || 'draft'}, NOW()
      )
      RETURNING *
    `
    
    return NextResponse.json({ success: true, story: result[0] })
  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const { id, name, title, quote, income, strategy, slug, status, is_published, display_order } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }
    
    const result = await sql`
      UPDATE success_stories
      SET 
        name = COALESCE(${name}, name),
        title = COALESCE(${title}, title),
        quote = COALESCE(${quote}, quote),
        income = COALESCE(${income}, income),
        strategy = COALESCE(${strategy}, strategy),
        slug = COALESCE(${slug}, slug),
        status = COALESCE(${status}, status),
        is_published = COALESCE(${is_published}, is_published),
        display_order = COALESCE(${display_order}, display_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json({ success: true, story: result[0] })
  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }
    
    await sql`DELETE FROM success_stories WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 })
  }
}
