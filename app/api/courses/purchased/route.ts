import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get current user email from session or auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract user info - in a real app, validate the session properly
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await sql(
      `SELECT o.*, c.title as course_title, c.slug as course_slug
       FROM orders o
       JOIN courses c ON o.course_id = c.id
       WHERE o.email = $1 AND o.status = 'completed'
       ORDER BY o.paid_at DESC`,
      [userEmail]
    )

    const coursesWithDocs = await Promise.all(
      orders.map(async (order: any) => {
        const documents = await sql(
          `SELECT id, filename, file_type, uploaded_date, pathname
           FROM course_documents
           WHERE course_id = $1
           ORDER BY uploaded_date DESC`,
          [order.course_id]
        )
        return {
          ...order,
          documents,
          course_id: order.course_id,
          purchase_date: order.paid_at,
          price_paid: order.amount_cents,
        }
      })
    )

    return NextResponse.json(coursesWithDocs)
  } catch (error) {
    console.error('[v0] Error fetching purchased courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchased courses' },
      { status: 500 }
    )
  }
}
