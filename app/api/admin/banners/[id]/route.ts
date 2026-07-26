import { sql, getSql } from "@/lib/db"
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const { title, message, bannerType, linkUrl, linkText, bgColor, startsAt, endsAt, isActive } = await request.json()
    const bannerId = parseInt(params.id)

    const banner = await sql(
      `UPDATE banners SET 
        title = COALESCE($1, title),
        message = COALESCE($2, message),
        banner_type = COALESCE($3, banner_type),
        link_url = COALESCE($4, link_url),
        link_text = COALESCE($5, link_text),
        bg_color = COALESCE($6, bg_color),
        starts_at = COALESCE($7, starts_at),
        ends_at = COALESCE($8, ends_at),
        is_active = COALESCE($9, is_active),
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, message, bannerType, linkUrl, linkText, bgColor, startsAt, endsAt, isActive, bannerId]
    )

    if (banner.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json(banner[0])
  } catch (error) {
    console.error('[v0] Error updating banner:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = getSql()
    const bannerId = parseInt(params.id)

    const result = await sql(`DELETE FROM banners WHERE id = $1`, [bannerId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting banner:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}
