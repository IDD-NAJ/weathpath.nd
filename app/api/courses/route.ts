import { neon } from '@neondatabase/serverless'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    const sql = neon(process.env.DATABASE_URL!)
    const courses = await sql(
      'SELECT id, slug, title, description, price_cents, cover_image, category, level, lessons, duration FROM courses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    )

    console.log('[v0] API: Courses fetched:', courses?.length || 0)

    const countResult = await sql('SELECT COUNT(*) as count FROM courses')
    const total = countResult[0]?.count || 0

    return Response.json({
      courses: courses || [],
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('[v0] Courses API error:', error?.message || error)
    return Response.json(
      { error: 'Failed to fetch courses', details: error?.message },
      { status: 500 }
    )
  }
}
