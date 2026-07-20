import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause = ''
    let params: any[] = []

    if (userId) {
      whereClause = 'WHERE ua.user_id = $1'
      params = [userId, limit, offset]
    } else {
      params = [limit, offset]
    }

    const activities = await sql`
      SELECT 
        ua.id,
        ua.activity_type,
        ua.activity_data,
        ua.created_at,
        u.name,
        u.email,
        ua.ip_address
      FROM user_activity ua
      JOIN users u ON ua.user_id = u.id
      ${whereClause}
      ORDER BY ua.created_at DESC
      LIMIT $${userId ? '2' : '1'} OFFSET $${userId ? '3' : '2'}
    `

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('User activity API error:', error)
    return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
  }
}
