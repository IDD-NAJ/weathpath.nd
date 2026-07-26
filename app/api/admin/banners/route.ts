import { sql, getSql } from "@/lib/db"
import { NextRequest, NextResponse } from 'next/server'

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
    const sql = getSql()
    const { title, message, bannerType, linkUrl, linkText, bgColor, startsAt, endsAt, isActive } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    const banner = await sql(
      `INSERT INTO banners (title, message, banner_type, link_url, link_text, bg_color, is_active, starts_at, ends_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [title, message, bannerType || 'announcement', linkUrl || null, linkText || null, bgColor || '#1f2937', isActive !== false, startsAt || null, endsAt || null]
    )

    return NextResponse.json(banner[0])
  } catch (error) {
    console.error('[v0] Error creating banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
