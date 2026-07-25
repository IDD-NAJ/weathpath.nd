import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const banners = await sql(
      `SELECT * FROM banners ORDER BY created_at DESC`,
    )
    return NextResponse.json(banners)
  } catch (error) {
    console.error('[v0] Error fetching banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, startDate, endDate, isActive } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const banner = await sql(
      `INSERT INTO banners (title, content, type, start_date, end_date, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [title, content, type || 'announcement', startDate || null, endDate || null, isActive !== false]
    )

    return NextResponse.json(banner[0])
  } catch (error) {
    console.error('[v0] Error creating banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
