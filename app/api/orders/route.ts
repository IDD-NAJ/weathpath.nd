import { sql } from "@/lib/db"
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { course_id, email, name, amount, status } = await request.json()

    if (!course_id || !email || !name || amount === undefined) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    
    const order_id = randomUUID()

    // Create order
    const order = await sql(
      `INSERT INTO orders (id, course_id, email, name, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [order_id, course_id, email, name, amount, status || 'pending']
    )

    // TODO: In production, send email via Resend or other service
    // For now, log it for demonstration
    console.log('[v0] Order created, email delivery queued:', {
      order: order_id,
      email,
      status: 'queued_for_delivery',
    })

    return Response.json({ order: order[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Orders API error:', error)
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const order_id = searchParams.get('id')

    const sql = neon(process.env.DATABASE_URL!)

    if (order_id) {
      const result = await sql(
        `SELECT o.*, c.title as course_title, c.description as course_description
         FROM orders o
         JOIN courses c ON o.course_id = c.id
         WHERE o.id = $1`,
        [order_id]
      )
      return Response.json({ order: result[0] || null })
    }

    if (email) {
      const results = await sql(
        `SELECT o.*, c.title as course_title
         FROM orders o
         JOIN courses c ON o.course_id = c.id
         WHERE o.email = $1
         ORDER BY o.created_at DESC`,
        [email]
      )
      return Response.json({ orders: results })
    }

    return Response.json({ error: 'No query provided' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Orders API error:', error)
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
