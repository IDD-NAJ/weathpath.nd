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
        SELECT a.*, u.name as author_name
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        WHERE a.status = ${status}
        ORDER BY a.created_at DESC
      `
    } else {
      query = sql`
        SELECT a.*, u.name as author_name
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        ORDER BY a.created_at DESC
      `
    }
    
    const articles = await query
    
    return NextResponse.json({ success: true, articles })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    
    const { title, content, excerpt, description, category, slug, status } = body
    
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }
    
    const result = await sql`
      INSERT INTO articles (
        title, slug, content, excerpt, category, author_id, status, is_published, created_at, updated_at
      ) VALUES (
        ${title}, ${slug}, ${content || ''}, ${excerpt || description || ''}, ${category || 'General'}, 
        ${user.id}, ${status || 'draft'}, ${status === 'published'}, NOW(), NOW()
      )
      RETURNING *
    `
    
    return NextResponse.json({ success: true, article: result[0] })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const { id, title, content, excerpt, category, slug, status, is_published } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }
    
    const result = await sql`
      UPDATE articles
      SET 
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        content = COALESCE(${content}, content),
        excerpt = COALESCE(${excerpt}, excerpt),
        category = COALESCE(${category}, category),
        status = COALESCE(${status}, status),
        is_published = COALESCE(${is_published}, is_published),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json({ success: true, article: result[0] })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }
    
    await sql`DELETE FROM articles WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
