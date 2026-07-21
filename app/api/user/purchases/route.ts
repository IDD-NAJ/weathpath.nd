import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Fetch user purchases with course details
    const purchases = await sql(`
      SELECT 
        up.id,
        up.course_id,
        up.user_email,
        up.payment_status,
        up.created_at,
        c.id as course_id_detail,
        c.slug,
        c.title,
        c.subtitle,
        c.cover_image,
        c.level,
        c.category,
        c.duration,
        c.lessons,
        c.price_cents
      FROM user_purchases up
      LEFT JOIN courses c ON up.course_id = c.id
      WHERE up.user_email = $1
      ORDER BY up.created_at DESC
    `, [email])

    // Transform the response
    const formattedPurchases = purchases.map((purchase: any) => ({
      id: purchase.id,
      course_id: purchase.course_id,
      user_email: purchase.user_email,
      payment_status: purchase.payment_status,
      created_at: purchase.created_at,
      course: {
        id: purchase.course_id_detail,
        slug: purchase.slug,
        title: purchase.title,
        subtitle: purchase.subtitle,
        cover_image: purchase.cover_image,
        level: purchase.level,
        category: purchase.category,
        duration: purchase.duration,
        lessons: purchase.lessons,
        price_cents: purchase.price_cents,
      },
    }))

    return NextResponse.json(formattedPurchases)
  } catch (error: any) {
    console.error('[v0] Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
