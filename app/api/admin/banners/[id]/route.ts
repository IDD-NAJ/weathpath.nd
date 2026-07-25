import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content, type, startDate, endDate, isActive } = await request.json()
    const bannerId = parseInt(params.id)

    const banner = await sql(
      `UPDATE banners SET 
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        type = COALESCE($3, type),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, content, type, startDate, endDate, isActive, bannerId]
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
    const bannerId = parseInt(params.id)

    const result = await sql(`DELETE FROM banners WHERE id = $1`, [bannerId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting banner:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}
